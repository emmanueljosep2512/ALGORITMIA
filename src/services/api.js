/**
 * AlgoritmIA — API Service Layer
 * 
 * Conecta el frontend con el backend proxy.
 */

import { getAuth } from 'firebase/auth';

const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:3848'
    : 'https://server-rose-theta-28.vercel.app';

// Mapas de categorías de YouTube a nombres legibles
const CATEGORY_MAP = {
    '1': 'Film & Animation', '2': 'Autos', '10': 'Music',
    '15': 'Pets', '17': 'Sports', '19': 'Travel',
    '20': 'Gaming', '22': 'People & Blogs', '23': 'Comedy',
    '24': 'Entertainment', '25': 'News', '26': 'Howto & Style',
    '27': 'Education', '28': 'Science & Tech', '29': 'Nonprofits',
};

/**
 * Helper para obtener el ID Token de Firebase
 */
async function getAuthHeaders() {
    const auth = getAuth();
    const user = auth.currentUser;
    const headers = { 'Content-Type': 'application/json' };

    if (user) {
        const token = await user.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
}

/**
 * Verificar si el backend está corriendo y configurado
 */
export async function checkHealth() {
    try {
        const res = await fetch(`${API_BASE}/api/health`);
        if (!res.ok) return { ok: false, error: 'Backend no responde' };
        return { ok: true, ...(await res.json()) };
    } catch {
        return { ok: false, error: 'Backend no disponible. Ejecuta: cd server && npm run dev' };
    }
}

/**
 * Obtener videos trending en tiempo real
 */
export async function fetchTrending({ region = 'US', category = '0', max = 24 } = {}) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/trending?region=${region}&category=${category}&max=${max}`, {
        headers
    });
    if (!res.ok) throw new Error(`Error ${res.status}: ${(await res.json())?.error || res.statusText}`);
    const data = await res.json();
    return enrichVideos(data.videos, data.meta);
}

/**
 * Buscar videos por keyword
 */
export async function searchVideos({ q, max = 12, language = '', region = '', order = 'viewCount', publishedAfter = '' } = {}) {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams({ q, max, language, region, order, publishedAfter });
    const res = await fetch(`${API_BASE}/api/search?${params}`, {
        headers
    });
    if (!res.ok) throw new Error(`Error ${res.status}: ${(await res.json())?.error || res.statusText}`);
    const data = await res.json();
    return enrichVideos(data.videos, data.meta);
}

/**
 * Obtener datos de un canal específico
 */
export async function fetchChannel(channelId) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/channel/${channelId}`, { headers });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
}

/**
 * Obtener categorías de YouTube para una región
 */
export async function fetchCategories(region = 'US') {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/categories?region=${region}`, { headers });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
}

/**
 * Obtener tendencias de mercado (Google Trends RSS)
 */
export async function fetchMarketTrends(geo = 'US') {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/market-trends?geo=${geo}`, { headers });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
}

/**
 * Obtener consejos de IA basados en datos reales
 */
export async function fetchAIAdvisor({ niche, stats, videos }) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/ai-advisor`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ niche, stats, videos }),
    });
    if (!res.ok) throw new Error(`Error ${res.status}: ${(await res.json())?.error || 'Error desconocido'}`);
    return res.json();
}

/**
 * Analizar un video específico (Métricas + IA)
 */
export async function analyzeVideo(videoId) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/analyze-video?id=${videoId}`, { headers });
    if (!res.ok) throw new Error(`Error ${res.status}: ${(await res.json())?.error || 'Error al analizar video'}`);
    const data = await res.json();
    return {
        video: {
            ...data.video,
            publishedAt: new Date(data.video.publishedAt),
            channelAvatar: data.video.channelAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.video.channel)}&backgroundColor=7B2FFF&textColor=fff`,
        },
        analysis: data.analysis,
    };
}

/**
 * Enriquecer datos de videos con formato consistente para el UI
 */
function enrichVideos(videos, meta) {
    return {
        videos: (videos || []).map(v => ({
            ...v,
            publishedAt: new Date(v.publishedAt),
            category: CATEGORY_MAP[v.category] || v.category || 'General',
            channelAvatar: v.channelAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(v.channel)}&backgroundColor=7B2FFF&textColor=fff`,
        })),
        meta,
    };
}

/**
 * Buscar Reels populares de Meta
 */
export async function searchMetaReels({ q = '', category = 'Todas' } = {}) {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams({ q, category });
    const res = await fetch(`${API_BASE}/api/meta/search?${params}`, { headers });
    if (!res.ok) throw new Error(`Error ${res.status}: ${(await res.json())?.error || res.statusText}`);
    return res.json();
}

/**
 * Analizar un Reel de Meta por su URL
 */
export async function analyzeMetaReel(url) {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams({ url });
    const res = await fetch(`${API_BASE}/api/meta/analyze-reel?${params}`, { headers });
    if (!res.ok) throw new Error(`Error ${res.status}: ${(await res.json())?.error || 'Error al analizar el Reel'}`);
    return res.json();
}

/**
 * Buscar anuncios en la biblioteca de Meta
 */
export async function fetchMetaAds({ q = '', category = 'Todas' } = {}) {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams({ q, category });
    const res = await fetch(`${API_BASE}/api/meta/ad-spy?${params}`, { headers });
    if (!res.ok) throw new Error(`Error ${res.status}: ${(await res.json())?.error || res.statusText}`);
    return res.json();
}

/**
 * Analizar un anuncio de Meta (Deconstrucción + IA)
 */
export async function analyzeMetaAd(ad) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/meta/analyze-ad`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ad })
    });
    if (!res.ok) throw new Error(`Error ${res.status}: \${(await res.json())?.error || 'Error al analizar el anuncio'}`);
    return res.json();
}

/**
 * Generar copys y guiones para Meta con IA
 */
export async function generateMetaCopy({ niche, platform = 'Instagram', type = 'Reel Script' }) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/meta/ai-copywriter`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ niche, platform, type })
    });
    if (!res.ok) throw new Error(`Error ${res.status}: ${(await res.json())?.error || 'Error al generar'}`);
    return res.json();
}

// ═══════════════════════════════════════════════════
// FORMATEADORES (compartidos para uso en componentes)
// ═══════════════════════════════════════════════════
export const formatViews = (v) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${Math.round(v / 1_000)}K`;
    return String(v);
};

export const formatSubs = (s) => {
    if (s >= 1_000_000) return `${(s / 1_000_000).toFixed(1)}M`;
    if (s >= 1_000) return `${(s / 1_000).toFixed(1)}K`;
    return String(s);
};

export const formatVPH = (v) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M/h`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K/h`;
    return `${v}/h`;
};

export const timeAgo = (date) => {
    if (!(date instanceof Date)) date = new Date(date);
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 60) return `Hace ${mins}m`;
    const h = Math.floor(mins / 60);
    if (h < 24) return `Hace ${h}h`;
    const d = Math.floor(h / 24);
    return `Hace ${d}d`;
};

/**
 * Inicializar una orden de pago de Binance Pay (manual o automática)
 */
export async function createBinanceOrder(plan) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/payment/binance/create-order`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            plan,
            returnUrl: `${window.location.origin}/suscripcion`
        })
    });
    if (!res.ok) throw new Error(`Error ${res.status}: ${(await res.json())?.error || 'Error al crear orden de Binance Pay'}`);
    return res.json();
}

/**
 * Enviar comprobante de transacción manual para verificación
 */
export async function verifyManualBinancePayment({ transactionId, plan, merchantTradeNo }) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/payment/binance/verify-manual`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ transactionId, plan, merchantTradeNo })
    });
    if (!res.ok) throw new Error(`Error ${res.status}: ${(await res.json())?.error || 'Error al enviar reporte de pago'}`);
    return res.json();
}

/**
 * Inicializar perfil de usuario en el backend (valida IP y asigna créditos gratis de bienvenida)
 */
export async function initializeUserProfile() {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/user/initialize`, {
        method: 'POST',
        headers
    });
    if (!res.ok) throw new Error(`Error ${res.status}: ${(await res.json())?.error || 'Error al inicializar usuario'}`);
    return res.json();
}


