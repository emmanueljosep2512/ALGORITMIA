/**
 * AlgoritmIA — Backend Proxy Server
 */

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import Parser from 'rss-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Groq from 'groq-sdk';
import admin from 'firebase-admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const app = express();

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3848',
];

app.use(cors({
    origin: function (origin, callback) {
        // Permitir peticiones sin origen (como herramientas de prueba o llamadas internas)
        if (!origin) return callback(null, true);
        
        // Permitir localhost, subdominios de vercel.app o subdominios de pages.dev (Cloudflare)
        const isAllowed = allowedOrigins.includes(origin) || 
                          origin.endsWith('.vercel.app') || 
                          origin.endsWith('.pages.dev') || 
                          /^https?:\/\/localhost:\d+$/.test(origin);
                          
        if (!isAllowed) {
            console.warn(`🚨 Intento de petición bloqueado por CORS desde origen: ${origin}`);
            const msg = 'La política CORS de este servidor no permite peticiones desde el origen especificado.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

app.use(express.json());

const parser = new Parser({
    customFields: {
        item: [
            ['ht:approx_traffic', 'traffic'],
        ],
    }
});
const PORT = process.env.PORT || 3848;
const YT_API_KEYS = (process.env.YOUTUBE_API_KEYS || '').split(',').map(k => k.trim()).filter(Boolean);
let currentKeyIndex = 0;

// Configuración Firebase Admin (Backend Security)
try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("✅ Firebase Admin inicializado.");
    } else {
        console.warn("⚠️ FIREBASE_SERVICE_ACCOUNT no encontrada. El backend está en modo 'abierto' temporalmente.");
    }
} catch (err) {
    console.error("❌ Error inicializando Firebase Admin:", err.message);
}

// Middleware de Autenticación
const checkAuth = async (req, res, next) => {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
        console.warn("⚠️ FIREBASE_SERVICE_ACCOUNT no configurada. El servidor opera en modo abierto temporalmente.");
        return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No autorizado. Se requiere token.' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Error verificando token:', error.message);
        res.status(403).json({ error: 'Token inválido o expirado.' });
    }
};

// Configuración Groq AI
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const YT_BASE = 'https://www.googleapis.com/youtube/v3';

// ═══════════════════════════════════════════════════
// CACHE (en memoria, TTL de 10 minutos)
// ═══════════════════════════════════════════════════
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 min

function getCached(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > CACHE_TTL) { cache.delete(key); return null; }
    return entry.data;
}

function setCache(key, data) {
    cache.set(key, { data, ts: Date.now() });
}

// ═══════════════════════════════════════════════════
// HELPER: Fetch YouTube API con Rotación Automática
// ═══════════════════════════════════════════════════
async function ytFetch(endpoint, params = {}, retryCount = 0) {
    if (YT_API_KEYS.length === 0) {
        throw new Error('No hay YOUTUBE_API_KEYS configuradas.');
    }

    const currentKey = YT_API_KEYS[currentKeyIndex];
    const url = new URL(`${YT_BASE}/${endpoint}`);
    url.searchParams.set('key', currentKey);

    for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== '') url.searchParams.set(k, v);
    }

    const res = await fetch(url.toString());

    if (res.status === 403 && retryCount < YT_API_KEYS.length) {
        console.warn(`⚠️ Llave #${currentKeyIndex + 1} agotada. Rotando...`);
        currentKeyIndex = (currentKeyIndex + 1) % YT_API_KEYS.length;
        return ytFetch(endpoint, params, retryCount + 1);
    }

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`YouTube API ${res.status}: ${err?.error?.message || res.statusText}`);
    }

    return res.json();
}

// ═══════════════════════════════════════════════════
// MOTOR: MOMENTUM & FORMATTING
// ═══════════════════════════════════════════════════
function calculateMomentumScore(video, channelAvgViews = null) {
    const views = parseInt(video.statistics?.viewCount || 0);
    const likes = parseInt(video.statistics?.likeCount || 0);
    const comments = parseInt(video.statistics?.commentCount || 0);
    const published = new Date(video.snippet?.publishedAt);
    const hoursAgo = Math.max(1, (Date.now() - published.getTime()) / (1000 * 60 * 60));

    const vph = views / hoursAgo;
    const vphScore = Math.min(100, (vph / 500) * 100);

    const avgViews = channelAvgViews || views * 0.3;
    const outlierRatio = avgViews > 0 ? views / avgViews : 1;
    const outlierScore = Math.min(100, (outlierRatio / 10) * 100);

    const engPerHour = (likes + comments) / hoursAgo;
    const engScore = Math.min(100, (engPerHour / 50) * 100);

    const engRate = views > 0 ? ((likes + comments) / views) * 100 : 0;
    const engRateScore = Math.min(100, (engRate / 5) * 100);

    const recencyScore = hoursAgo < 6 ? 100 : hoursAgo < 24 ? 80 : hoursAgo < 48 ? 50 : 10;
    const scaleScore = Math.min(100, (views / 100000) * 100);

    const momentum = Math.round(
        vphScore * 0.30 + outlierScore * 0.25 + engScore * 0.20 + engRateScore * 0.10 + recencyScore * 0.10 + scaleScore * 0.05
    );

    let trending = 'normal';
    if (momentum >= 85) trending = 'fire';
    else if (momentum >= 65) trending = 'hot';
    else if (momentum >= 45) trending = 'rising';

    return {
        momentumScore: Math.min(99, Math.max(1, momentum)),
        trending,
        vph: Math.round(vph),
        outlierRatio: Math.round(outlierRatio * 10) / 10,
        engagementRate: Math.round(engRate * 100) / 100,
    };
}

function transformVideo(item, momentum = null) {
    const snippet = item.snippet || {};
    const stats = item.statistics || {};
    const contentDetails = item.contentDetails || {};
    const views = parseInt(stats.viewCount || 0);

    const dur = contentDetails.duration || 'PT0S';
    const match = dur.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    const h = parseInt(match?.[1] || 0);
    const m = parseInt(match?.[2] || 0);
    const s = parseInt(match?.[3] || 0);
    const durationStr = h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;

    const mom = momentum || calculateMomentumScore(item);

    return {
        id: item.id?.videoId || item.id,
        title: snippet.title || 'Sin título',
        channel: snippet.channelTitle || 'Canal desconocido',
        channelId: snippet.channelId || '',
        channelAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(snippet.channelTitle || 'YT')}`,
        channelSubs: 0,
        thumbnail: snippet.thumbnails?.high?.url || '',
        views,
        likes: parseInt(stats.likeCount || 0),
        comments: parseInt(stats.commentCount || 0),
        publishedAt: snippet.publishedAt,
        duration: durationStr,
        vph: mom.vph,
        outlierRatio: mom.outlierRatio,
        engagementRate: mom.engagementRate,
        momentumScore: mom.momentumScore,
        trending: mom.trending,
        _source: 'youtube_api_v3',
    };
}

// ═══════════════════════════════════════════════════
// ENDPOINTS (PROTEGIDOS POR checkAuth)
// ═══════════════════════════════════════════════════

app.get('/api/trending', checkAuth, async (req, res) => {
    try {
        const { region = 'US', category = '0', max = '24' } = req.query;
        const cacheKey = `trending:${region}:${category}:${max}`;
        const cached = getCached(cacheKey);
        if (cached) return res.json(cached);

        const data = await ytFetch('videos', {
            part: 'snippet,statistics,contentDetails',
            chart: 'mostPopular',
            regionCode: region,
            videoCategoryId: category !== '0' ? category : undefined,
            maxResults: Math.min(parseInt(max), 50),
        });

        const videos = (data.items || []).map(item => transformVideo(item));

        // Enriquecer subs
        const ids = [...new Set(videos.map(v => v.channelId))];
        if (ids.length) {
            const chData = await ytFetch('channels', { part: 'statistics', id: ids.join(',') });
            const map = {};
            (chData.items || []).forEach(c => map[c.id] = parseInt(c.statistics?.subscriberCount || 0));
            videos.forEach(v => v.channelSubs = map[v.channelId] || 0);
        }

        videos.sort((a, b) => b.momentumScore - a.momentumScore);
        const result = { videos, meta: { source: 'YouTube API', count: videos.length } };
        setCache(cacheKey, result);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/search', checkAuth, async (req, res) => {
    try {
        const { q, max = '12', order = 'viewCount' } = req.query;
        if (!q) return res.status(400).json({ error: 'Falta q' });

        const cacheKey = `search:${q}:${max}:${order}`;
        const cached = getCached(cacheKey);
        if (cached) return res.json(cached);

        const sData = await ytFetch('search', { part: 'snippet', q, type: 'video', maxResults: Math.min(parseInt(max), 20), order });
        const ids = (sData.items || []).map(i => i.id?.videoId).filter(Boolean);

        if (!ids.length) return res.json({ videos: [] });

        const vData = await ytFetch('videos', { part: 'snippet,statistics,contentDetails', id: ids.join(',') });
        const videos = (vData.items || []).map(item => transformVideo(item));

        // Enriquecer subs y recalcular momentum con data real del canal
        const chIds = [...new Set(videos.map(v => v.channelId))];
        const chData = await ytFetch('channels', { part: 'statistics', id: chIds.join(',') });
        const chMap = {};
        (chData.items || []).forEach(c => {
            const s = c.statistics;
            chMap[c.id] = { subs: parseInt(s.subscriberCount || 0), views: parseInt(s.viewCount || 0), vCount: parseInt(s.videoCount || 1) };
        });

        videos.forEach(v => {
            const info = chMap[v.channelId];
            if (info) {
                v.channelSubs = info.subs;
                const m = calculateMomentumScore({ snippet: { publishedAt: v.publishedAt }, statistics: { viewCount: String(v.views), likeCount: String(v.likes), commentCount: String(v.comments) } }, info.views / info.vCount);
                v.vph = m.vph;
                v.outlierRatio = m.outlierRatio;
                v.momentumScore = m.momentumScore;
                v.trending = m.trending;
            }
        });

        videos.sort((a, b) => b.momentumScore - a.momentumScore);
        const result = { videos, meta: { query: q, count: videos.length } };
        setCache(cacheKey, result);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/ai-advisor', checkAuth, async (req, res) => {
    try {
        const { niche, stats, videos } = req.body;
        if (!niche || !process.env.GROQ_API_KEY) return res.status(400).json({ error: 'Faltan datos' });

        const prompt = `
# CONTEXT
You are the elite "Cerebro IA" for AlgoritmIA, a premium SaaS platform designed for professional YouTube creators and automated channel builders. Your goal is to analyze the feasibility of entering the specified niche.

# OBJECTIVE
Perform a clinical, data-backed feasibility and growth analysis of the YouTube niche: "${niche}".
Use the following actual market metrics:
- Audience Demand: ${stats.demand}
- Saturation / Competition: ${stats.competition}
- CPM Monetization Potential: ${stats.cpmRange}
- Sample of analyzed videos: ${videos.length} videos.

# STYLE
Objective, data-driven, strategic, and concise. Write in professional Spanish (es-ES). Avoid introductory fluff or platitudes. Get straight to the analysis.

# TONE
Analytical, realistic, and highly authoritative.

# AUDIENCE
Savvy YouTube automation entrepreneurs and content creators looking to maximize ROI and viewer retention.

# RESPONSE FORMAT (MARKDOWN)
Structure the analysis exactly as follows:
### 📊 ANÁLISIS DE VIABILIDAD
[Provide a rigorous assessment based on the demand, competition, and CPM tier. Explicitly comment on the entry timing (is it a good time or is the market saturated/decaying?).]

### 🎯 ÁNGULOS DE CONTENIDO
[Provide exactly 3 distinct, high-potential sub-niches or content angles that have high search demand but low saturation. Format as:
1. **[Angle Title]**: [Brief description of what the content is about and why it works].
2. **[Angle Title]**: ...
3. **[Angle Title]**: ...]

### ⚡ ESTRATEGIA DE RETENCIÓN
[Give one high-impact, technical scripting or retention hook advice tailored to this niche to outperform the current competitors (e.g., visual pacing, narrative hook in the first 5 seconds, pattern interrupts).]

# THINKING METHODOLOGY (CHAIN OF THOUGHT)
Before generating the final response, write your internal step-by-step reasoning about why this niche is viable or not, how you chose the angles, and the retention hook inside <thought>...</thought> tags. Focus on self-consistency by cross-referencing the CPM with typical audience demographics for "${niche}".
`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
        });

        let advice = chatCompletion.choices[0]?.message?.content || 'No se pudo generar el consejo.';
        // Remove <thought>...</thought> tags to keep output premium
        advice = advice.replace(/<thought>[\s\S]*?<\/thought>/gi, '').trim();

        res.json({ advice });
    } catch (err) {
        console.error('Groq Error:', err);
        res.status(500).json({ error: 'Error en el motor de IA Groq' });
    }
});

app.get('/api/market-trends', checkAuth, async (req, res) => {
    try {
        const geo = req.query.geo || 'US';
        const url = `https://trends.google.com/trending/rss?geo=${geo.toUpperCase()}`;
        
        const feed = await parser.parseURL(url);
        const trends = (feed.items || []).map(item => ({
            title: item.title || '',
            link: item.link || '',
            traffic: item.traffic || '10K+'
        }));

        res.json({ trends });
    } catch (err) {
        console.error('Error fetching market trends:', err.message);
        res.status(500).json({ error: 'Error al obtener tendencias de búsqueda.' });
    }
});

app.get('/api/categories', checkAuth, async (req, res) => {
    try {
        const region = req.query.region || 'US';
        const data = await ytFetch('videoCategories', {
            part: 'snippet',
            regionCode: region
        });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/channel/:channelId', checkAuth, async (req, res) => {
    try {
        const { channelId } = req.params;
        const data = await ytFetch('channels', {
            part: 'snippet,statistics,brandingSettings',
            id: channelId
        });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/analyze-video', checkAuth, async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'Falta id del video' });

        const cacheKey = `analyze:${id}`;
        const cached = getCached(cacheKey);
        if (cached) return res.json(cached);

        // 1. Obtener detalles del video
        const vData = await ytFetch('videos', { part: 'snippet,statistics,contentDetails', id });
        if (!vData.items || vData.items.length === 0) {
            return res.status(404).json({ error: 'Video no encontrado en YouTube' });
        }
        const rawVideo = vData.items[0];

        // 2. Obtener estadísticas del canal
        const channelId = rawVideo.snippet?.channelId;
        let channelSubs = 0;
        let channelAvgViews = null;
        if (channelId) {
            try {
                const chData = await ytFetch('channels', { part: 'statistics', id: channelId });
                if (chData.items && chData.items.length > 0) {
                    const stats = chData.items[0].statistics || {};
                    channelSubs = parseInt(stats.subscriberCount || 0);
                    const chViews = parseInt(stats.viewCount || 0);
                    const chVids = parseInt(stats.videoCount || 1);
                    channelAvgViews = chViews / chVids;
                }
            } catch (chErr) {
                console.warn('Error fetching channel stats for analysis:', chErr.message);
            }
        }

        // 3. Calcular momentum y transformar
        const mom = calculateMomentumScore(rawVideo, channelAvgViews);
        const video = transformVideo(rawVideo, mom);
        video.channelSubs = channelSubs;

        // 4. Generar análisis con IA si Groq está disponible
        let analysis = 'No se pudo generar el análisis en este momento.';
        if (process.env.GROQ_API_KEY) {
            const prompt = `
# CONTEXT
You are the elite "Cerebro IA" for AlgoritmIA. Your task is to perform a clinical, data-backed success analysis of a specific YouTube video.

# OBJECTIVE
Analyze the following video details and performance metrics:
- Video Title: "${video.title}"
- Channel Name: "${video.channel}" (with ${channelSubs.toLocaleString()} subscribers)
- Total Views: ${video.views.toLocaleString()} views
- Views Per Hour (VPH): ${video.vph} VPH
- Outlier Multiplier (Outlier Ratio): x${video.outlierRatio} (this video performed ${video.outlierRatio}x better than the channel's historical average)
- Audience Engagement Rate: ${video.engagementRate}% (Likes & Comments vs Views)
- Momentum Score: ${video.momentumScore}/100 (Velocity rating: ${video.trending.toUpperCase()})

# STYLE
Objective, data-driven, strategic, and highly action-oriented. Write in professional Spanish (es-ES). Get straight to the point without introductory fluff.

# TONE
Analytical, authoritative, and encouraging.

# AUDIENCE
Creators and YTA entrepreneurs looking to replicate successful viral patterns.

# RESPONSE FORMAT (MARKDOWN)
Structure your output exactly as follows:
### 📈 FACTORES DE ÉXITO
[Deconstruct the title hook, thumbnail strategy, and visual framing. Why did this video achieve a ${video.outlierRatio}x multiplier compared to the channel's normal reach?]

### 🎯 ÁNGULO Y NARRATIVA
[Explain the core psychological trigger of this theme and content angle. Why did the audience click and stay?]

### 💡 CÓMO REPLICARLO
[Give a concrete, step-by-step actionable blueprint for the user to create their own video on this topic, stating the hook structure for the first 5 seconds and what pattern interrupts to use.]

# THINKING METHODOLOGY (CHAIN OF THOUGHT)
Before generating the final response, write your step-by-step reasoning inside <thought>...</thought> tags, analyzing the outlier ratio, the VPH speed, and the optimal hook strategy. Focus on self-consistency by matching the CPM potential of the topic with the proposed hook.
`;

            const chatCompletion = await groq.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: 'llama-3.3-70b-versatile',
            });

            let aiContent = chatCompletion.choices[0]?.message?.content || '';
            // Remove <thought>...</thought> tags
            analysis = aiContent.replace(/<thought>[\s\S]*?<\/thought>/gi, '').trim();
        }

        const result = { video, analysis };
        setCache(cacheKey, result);
        res.json(result);
    } catch (err) {
        console.error('Error in analyze-video:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════════════
// METRICS ENGINE & DATA SIMULATION: META (FB & IG)
// ═══════════════════════════════════════════════════

const MOCK_REELS_DATA = [
    {
        title: "3 herramientas de IA que parecen ilegales y te ahorran horas",
        channel: "tech_mindset",
        views: 284000,
        likes: 18400,
        comments: 342,
        shares: 9800,
        duration: "0:28",
        niche: "Tecnología",
        theme: "IA / Productividad",
        thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80"
    },
    {
        title: "Cómo facturar tus primeros $1,000 online sin inversión previa",
        channel: "guille_negocios",
        views: 450000,
        likes: 31000,
        comments: 890,
        shares: 14500,
        duration: "0:45",
        niche: "Finanzas",
        theme: "Emprendimiento",
        thumbnail: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&q=80"
    },
    {
        title: "Esta es la cruda realidad de vivir en una Tiny House 🏠",
        channel: "nomada_digital",
        views: 125000,
        likes: 7200,
        comments: 198,
        shares: 2400,
        duration: "0:59",
        niche: "Estilo de vida",
        theme: "Vivienda / Viajes",
        thumbnail: "https://images.unsplash.com/photo-1525186402429-b4ff38bedec6?w=400&q=80"
    },
    {
        title: "El gran secreto de Costco que las marcas no quieren que sepas",
        channel: "ahorro_inteligente",
        views: 890000,
        likes: 64000,
        comments: 1120,
        shares: 32400,
        duration: "0:35",
        niche: "Finanzas",
        theme: "Hacks de Ahorro",
        thumbnail: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80"
    },
    {
        title: "Rutina express de 7 minutos en casa para marcar abdominales",
        channel: "fitness_rutinas",
        views: 180000,
        likes: 11000,
        comments: 145,
        shares: 6100,
        duration: "0:40",
        niche: "Salud / Fitness",
        theme: "Ejercicios",
        thumbnail: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=80"
    },
    {
        title: "El postre de chocolate más saludable del mundo (sin azúcar)",
        channel: "healthy_recetas",
        views: 310000,
        likes: 21000,
        comments: 412,
        shares: 18900,
        duration: "0:50",
        niche: "Salud / Fitness",
        theme: "Recetas",
        thumbnail: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=400&q=80"
    },
    {
        title: "Truco de fotografía móvil que cambiará tus fotos para siempre 📸",
        channel: "creativo_visual",
        views: 95000,
        likes: 5800,
        comments: 89,
        shares: 1900,
        duration: "0:15",
        niche: "Tecnología",
        theme: "Fotografía",
        thumbnail: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80"
    },
    {
        title: "Mi experiencia real usando la visa de nómada digital en Portugal",
        channel: "viajero_pro",
        views: 154000,
        likes: 9100,
        comments: 310,
        shares: 4800,
        duration: "0:55",
        niche: "Estilo de vida",
        theme: "Viajes / Trabajo",
        thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80"
    }
];

const MOCK_ADS_DATA = [
    {
        id: "ad_1",
        title: "Curso Avanzado de IA y Automatización con Python",
        status: "Activo",
        platform: "Instagram + Facebook",
        durationDays: 34,
        creativeUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&q=80",
        copy: "🚀 ¿Sigues haciendo tareas repetitivas? Deja que la Inteligencia Artificial trabaje por ti. Aprende a crear automatizaciones, agentes inteligentes y flujos de trabajo en Python en tiempo récord. Accede hoy con 50% de descuento de prelanzamiento.",
        cta: "Registrarse",
        niche: "Tecnología",
        targeting: "Emprendedores, Desarrolladores, Creadores (24-45 años)"
    },
    {
        id: "ad_2",
        title: "Plantilla Financiera Inteligente 2026 - Control 360",
        status: "Activo",
        platform: "Instagram + Facebook",
        durationDays: 18,
        creativeUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&q=80",
        copy: "📊 Deja de preguntarte a dónde se va tu dinero a fin de mes. Nuestra plantilla automatizada de Google Sheets rastrea tus ingresos, gastos, inversiones y proyecciones de ahorro en un solo panel interactivo y visualmente impecable. ¡Haz clic para descargar gratis!",
        cta: "Descargar",
        niche: "Finanzas",
        targeting: "Jóvenes Profesionales, Interesados en Ahorro e Inversión (20-38 años)"
    },
    {
        id: "ad_3",
        title: "Botella de Hidratación Térmica Inteligente con Filtro UV",
        status: "Activo",
        platform: "Instagram + Facebook",
        durationDays: 45,
        creativeUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80",
        copy: "💧 Agua pura y fría en cualquier parte del mundo. Esta botella térmica de acero inoxidable no solo mantiene la temperatura por 24 horas, sino que elimina el 99.9% de bacterias del agua en 60 segundos gracias a su tapa con purificador UV integrado. Envío gratuito hoy.",
        cta: "Comprar ahora",
        niche: "Salud / Fitness",
        targeting: "Interesados en Senderismo, Fitness, Ecología, Vida Saludable (18-40 años)"
    },
    {
        id: "ad_4",
        title: "Agencia de Viajes Boutique - Escapada a Tailandia",
        status: "Activo",
        platform: "Instagram + Facebook",
        durationDays: 7,
        creativeUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80",
        copy: "🌴 ¿Listo para tu próxima aventura? Diseñamos tu itinerario de 12 días por Tailandia con hoteles boutique de 5 estrellas, tours privados en templos sagrados, visitas a santuarios de elefantes y vuelos incluidos. Cupos súper limitados para la temporada de otoño.",
        cta: "Ver más",
        niche: "Estilo de vida",
        targeting: "Viajeros Frecuentes, Parejas, Amantes del Turismo Exótico (25-50 años)"
    }
];

// Endpoints Meta Intelligence
app.get('/api/meta/search', checkAuth, (req, res) => {
    try {
        const { q = '', category = 'Todas' } = req.query;
        let reels = [...MOCK_REELS_DATA];

        if (category !== 'Todas') {
            reels = reels.filter(r => r.niche.toLowerCase() === category.toLowerCase());
        }

        if (q) {
            const query = q.toLowerCase();
            reels = reels.filter(r => 
                r.title.toLowerCase().includes(query) || 
                r.channel.toLowerCase().includes(query) ||
                r.theme.toLowerCase().includes(query)
            );
        }

        // Si no hay resultados de la consulta, autogenerar un mock dinámico para dar excelente UX
        if (reels.length === 0 && q) {
            reels = [
                {
                    title: `El secreto oculto sobre "${q}" que nadie te cuenta`,
                    channel: `meta_creator_${q.replace(/\s+/g, '').toLowerCase().slice(0, 10)}`,
                    views: 150000 + Math.floor(Math.random() * 300000),
                    likes: 12000 + Math.floor(Math.random() * 20000),
                    comments: 200 + Math.floor(Math.random() * 500),
                    shares: 4000 + Math.floor(Math.random() * 8000),
                    duration: "0:30",
                    niche: category !== 'Todas' ? category : 'General',
                    theme: q,
                    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80"
                }
            ];
        }

        // Enriquecer con cálculo de Momentum adaptado a Reels
        const enrichedReels = reels.map((r, i) => {
            const shares = r.shares || Math.round(r.likes * 0.35);
            // En Reels, los compartidos importan más que los likes
            const engRate = ((r.likes + r.comments + shares) / r.views) * 100;
            const hoursAgo = 12 + (i * 8); // Simular antigüedad
            
            const vph = r.views / hoursAgo;
            const vphScore = Math.min(100, (vph / 800) * 100);
            
            const shareScore = Math.min(100, (shares / 3000) * 100);
            const engScore = Math.min(100, (engRate / 8) * 100);
            
            // Fórmula adaptada a Reels
            const momentum = Math.round(vphScore * 0.35 + shareScore * 0.35 + engScore * 0.3);
            
            let trending = 'normal';
            if (momentum >= 80) trending = 'fire';
            else if (momentum >= 60) trending = 'hot';
            else if (momentum >= 40) trending = 'rising';

            return {
                id: `reel_${i + 1}_${r.channel}`,
                title: r.title,
                channel: r.channel,
                channelAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.channel)}`,
                views: r.views,
                likes: r.likes,
                comments: r.comments,
                shares,
                duration: r.duration,
                publishedAt: new Date(Date.now() - (hoursAgo * 60 * 60 * 1000)).toISOString(),
                vph: Math.round(vph),
                engagementRate: Math.round(engRate * 100) / 100,
                momentumScore: Math.min(99, Math.max(1, momentum)),
                trending,
                thumbnail: r.thumbnail
            };
        });

        enrichedReels.sort((a, b) => b.momentumScore - a.momentumScore);
        res.json({ reels: enrichedReels, meta: { count: enrichedReels.length } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/meta/ad-spy', checkAuth, (req, res) => {
    try {
        const { q = '', category = 'Todas' } = req.query;
        let ads = [...MOCK_ADS_DATA];

        if (category !== 'Todas') {
            ads = ads.filter(a => a.niche.toLowerCase() === category.toLowerCase());
        }

        if (q) {
            const query = q.toLowerCase();
            ads = ads.filter(a => 
                a.title.toLowerCase().includes(query) || 
                a.copy.toLowerCase().includes(query)
            );
        }

        if (ads.length === 0 && q) {
            ads = [
                {
                    id: `ad_mock_${Date.now()}`,
                    title: `Anuncio Ganador sobre "${q}"`,
                    status: "Activo",
                    platform: "Instagram + Facebook",
                    durationDays: 14,
                    creativeUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&q=80",
                    copy: `🔥 ¿Quieres resolver tu problema con ${q}? Hemos creado la solución definitiva. Haz clic hoy y descubre cómo automatizar tu negocio y ahorrar hasta 15 horas semanales con nuestro nuevo sistema.`,
                    cta: "Ver más",
                    niche: category !== 'Todas' ? category : 'General',
                    targeting: "Emprendedores e interesados en el sector (18-45 años)"
                }
            ];
        }

        res.json({ ads, meta: { count: ads.length } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/meta/ai-copywriter', checkAuth, async (req, res) => {
    try {
        const { niche, platform = 'Instagram', type = 'Reel Script' } = req.body;
        if (!niche) return res.status(400).json({ error: 'Falta ingresar el nicho/idea' });

        if (!process.env.GROQ_API_KEY) {
            return res.json({ 
                content: `### 🎯 GANCHO DE RETENCIÓN (3 Segundos)
- **Visual**: Muestra texto en pantalla grande con degradado: *"El secreto de ${niche} que tu competencia odiaría que supieras"*.
- **Voz en Off**: "Si sigues haciendo esto para ${niche}, estás tirando dinero..."

### ⚡ ESTRUCTURA DEL GUION (Reel/Video Corto)
| Estímulo Visual (Pantalla) | Narración / Audio (Voz en Off) |
| --- | --- |
| Gancho de 3 segundos. Zoom rápido a tu cara. | "Esto es lo único que necesitas para dominar ${niche} hoy." |
| Mostrar gráfico en pantalla de rendimiento. | "Olvídate de las técnicas viejas. La clave real es la automatización inteligente." |
| Grabación de pantalla del software. | "Simplemente dejas que el sistema haga el análisis de datos por ti." |
| Llamado a la acción (CTA) con texto flotante. | "Comenta la palabra 'CEREBRO' abajo y te envío la herramienta gratis al privado." |

### ✍️ COPY PERSUASIVO (Para la descripción)
💥 **La verdad que nadie te dice sobre ${niche}...**

La mayoría de la gente pasa 10 horas semanales en esto, pero los profesionales lo resuelven en 5 minutos usando automatización.

Aquí tienes el plan de acción:
1️⃣ Define tu objetivo clave.
2️⃣ Utiliza el Cerebro AlgoritmIA.
3️⃣ Automatiza y escala.

👉 ¿Quieres probar la herramienta? Comenta **'CEREBRO'** abajo y te enviamos el link de acceso directamente por DM.

#${niche.replace(/\s+/g, '')} #inteligenciaartificial #emprendedores #negociosonline #creadoresdecontenido` 
            });
        }

        const prompt = `
# CONTEXT
You are the elite AI Copywriter for AlgoritmIA, a premium SaaS for creators and advertisers on Meta (Instagram & Facebook). Your mission is to write viral content assets for the specified niche: "${niche}".

# OBJECTIVE
Generate a highly engaging, high-retention content package optimized for:
- Platform: ${platform}
- Asset Type: ${type}

# RESPONSE FORMAT (MARKDOWN)
Structure the output exactly as follows:
### 🎯 GANCHO DE RETENCIÓN (3 Segundos)
- **Visual**: [Describe the exact visual frame, text on screen, and movement for the first 3 seconds of the video]
- **Voz en Off / Texto**: "[The exact spoken hook sentence or text read aloud, engineered for high curiosity]"

### ⚡ ESTRUCTURA DEL GUION (Reel/Video Corto)
Create a table with columns: "Estímulo Visual (Pantalla)" and "Narración / Audio (Voz en Off)".
Provide 4 chronological scenes (Hook, Problem, Solution, Call to Action). Ensure it is highly actionable and viral.

### ✍️ COPY PERSUASIVO (Para la descripción)
Write a professional, highly engaging caption for the post using copywriting frameworks like AIDA (Attention, Interest, Desire, Action) or PAS (Problem, Agitate, Solve). Include formatting (bolding, lists), interactive call-to-actions (e.g. "comenta la palabra X"), relevant emojis, and 5 highly targeted hashtags.

# STYLE
Professional, sharp, persuasive, and in native Spanish (es-ES). No fluff, no introductory greetings.
`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
        });

        const content = chatCompletion.choices[0]?.message?.content || 'No se pudo generar el copy.';
        res.json({ content });
    } catch (err) {
        console.error('Error in Meta Copywriter:', err.message);
        res.status(500).json({ error: 'Error al generar copy con IA.' });
    }
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        keys: YT_API_KEYS.length,
        keysConfigured: YT_API_KEYS.length,
        ai_engine: process.env.GROQ_API_KEY ? 'Groq' : 'None',
        auth_status: process.env.FIREBASE_SERVICE_ACCOUNT ? 'Protected' : 'Open (Dev Mode)'
    });
});

app.listen(PORT, () => {
    console.log(`\n🧠 AlgoritmIA Backend running on http://localhost:${PORT}`);
    console.log(`   YouTube Keys: ${YT_API_KEYS.length} | AI Engine: Groq`);
    console.log(`   Security: ${process.env.FIREBASE_SERVICE_ACCOUNT ? 'SHIELD ON' : 'OPEN MODE (Needs Service Account)'}`);
});
