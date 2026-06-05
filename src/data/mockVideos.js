// Mock Video Data — simulando YouTube Data API v3 + VPH calculado
// Arquitectura lista para reemplazar con llamadas reales a YouTube Data API v3

export const MOCK_VIDEOS = [
    {
        id: "v001",
        title: "How I Made $47,000 in 30 Days Selling Digital Products (Step by Step)",
        channel: "Income Academy",
        channelAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=IA&backgroundColor=7B2FFF&textColor=fff",
        channelSubs: 12400,
        thumbnail: "https://picsum.photos/seed/ytv1/640/360",
        views: 2_840_000,
        likes: 87000,
        comments: 4200,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 18),
        duration: "22:14",
        language: "en",
        category: "Finanzas",
        vph: 34800,
        avgChannelViews: 95000,
        outlierRatio: 29.9,
        engagementRate: 3.2,
        momentumScore: 94,
        trending: "fire",
        tags: ["digital products", "passive income", "online business"]
    },
    {
        id: "v002",
        title: "I Tried Running a $0 Business for 7 Days — Here's What Happened",
        channel: "StartupDen",
        channelAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=SD&backgroundColor=00D4FF&textColor=000",
        channelSubs: 8700,
        thumbnail: "https://picsum.photos/seed/ytv2/640/360",
        views: 1_560_000,
        likes: 52000,
        comments: 3100,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 31),
        duration: "15:42",
        language: "en",
        category: "Emprendimiento",
        vph: 18200,
        avgChannelViews: 42000,
        outlierRatio: 37.1,
        engagementRate: 3.5,
        momentumScore: 91,
        trending: "fire",
        tags: ["zero cost business", "side hustle", "entrepreneur"]
    },
    {
        id: "v003",
        title: "El Método Silencioso Para Ganar $5,000/Mes en YouTube Sin Grabar Tu Cara",
        channel: "Faceless Creator ES",
        channelAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=FC&backgroundColor=FF3B5C&textColor=fff",
        channelSubs: 3200,
        thumbnail: "https://picsum.photos/seed/ytv3/640/360",
        views: 980_000,
        likes: 41000,
        comments: 2800,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 22),
        duration: "18:07",
        language: "es",
        category: "YouTube Automation",
        vph: 14500,
        avgChannelViews: 18000,
        outlierRatio: 54.4,
        engagementRate: 4.5,
        momentumScore: 89,
        trending: "fire",
        tags: ["faceless youtube", "canal sin rostro", "youtube automation"]
    },
    {
        id: "v004",
        title: "Top 10 AI Tools That Will Replace Your Entire Team in 2025",
        channel: "AI Frontier",
        channelAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=AF&backgroundColor=00E5A0&textColor=000",
        channelSubs: 67000,
        thumbnail: "https://picsum.photos/seed/ytv4/640/360",
        views: 3_100_000,
        likes: 95000,
        comments: 7800,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 9),
        duration: "12:33",
        language: "en",
        category: "Inteligencia Artificial",
        vph: 62000,
        avgChannelViews: 380000,
        outlierRatio: 8.2,
        engagementRate: 3.3,
        momentumScore: 86,
        trending: "hot",
        tags: ["ai tools", "artificial intelligence", "productivity"]
    },
    {
        id: "v005",
        title: "Probé Hacer Dinero Con IA Durante 30 Días — Esto es lo que Gané",
        channel: "Tech en Español",
        channelAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=TE&backgroundColor=FFB800&textColor=000",
        channelSubs: 5500,
        thumbnail: "https://picsum.photos/seed/ytv5/640/360",
        views: 742_000,
        likes: 28000,
        comments: 1900,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 14),
        duration: "19:45",
        language: "es",
        category: "Inteligencia Artificial",
        vph: 9800,
        avgChannelViews: 22000,
        outlierRatio: 33.7,
        engagementRate: 4.0,
        momentumScore: 82,
        trending: "hot",
        tags: ["ganar dinero ia", "inteligencia artificial", "ingresos online"]
    },
    {
        id: "v006",
        title: "The 2-Hour YouTube Strategy That Gets 1M Views (No Subscribers Needed)",
        channel: "ViewBlast Lab",
        channelAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=VB&backgroundColor=7B2FFF&textColor=fff",
        channelSubs: 1800,
        thumbnail: "https://picsum.photos/seed/ytv6/640/360",
        views: 1_230_000,
        likes: 38000,
        comments: 2200,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
        duration: "10:18",
        language: "en",
        category: "YouTube Growth",
        vph: 7200,
        avgChannelViews: 11000,
        outlierRatio: 111.8,
        engagementRate: 3.3,
        momentumScore: 78,
        trending: "hot",
        tags: ["youtube views", "viral strategy", "youtube growth"]
    },
    {
        id: "v007",
        title: "Cómo Crear un Canal Rentable de Historia y Misterio con IA (Sin Experiencia)",
        channel: "MisterioDigital",
        channelAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=MD&backgroundColor=00D4FF&textColor=000",
        channelSubs: 920,
        thumbnail: "https://picsum.photos/seed/ytv7/640/360",
        views: 385_000,
        likes: 19000,
        comments: 1400,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 36),
        duration: "24:52",
        language: "es",
        category: "Entretenimiento",
        vph: 3100,
        avgChannelViews: 4500,
        outlierRatio: 85.6,
        engagementRate: 5.3,
        momentumScore: 73,
        trending: "rising",
        tags: ["misterio", "historia", "canal faceless es"]
    },
    {
        id: "v008",
        title: "I Built a $10,000/Month Automated YouTube Channel — Full Blueprint",
        channel: "PassiveStream",
        channelAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=PS&backgroundColor=FF3B5C&textColor=fff",
        channelSubs: 4100,
        thumbnail: "https://picsum.photos/seed/ytv8/640/360",
        views: 920_000,
        likes: 31000,
        comments: 2700,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
        duration: "28:11",
        language: "en",
        category: "YouTube Automation",
        vph: 4800,
        avgChannelViews: 35000,
        outlierRatio: 26.3,
        engagementRate: 3.7,
        momentumScore: 70,
        trending: "rising",
        tags: ["automated youtube", "passive income", "youtube automation"]
    },
    {
        id: "v009",
        title: "7 Nichos de YouTube SIN COMPETENCIA que nadie está haciendo en 2025",
        channel: "YT Domination ES",
        channelAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=YD&backgroundColor=00E5A0&textColor=000",
        channelSubs: 2300,
        thumbnail: "https://picsum.photos/seed/ytv9/640/360",
        views: 678_000,
        likes: 25000,
        comments: 1800,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 60),
        duration: "16:39",
        language: "es",
        category: "YouTube Growth",
        vph: 2800,
        avgChannelViews: 14000,
        outlierRatio: 48.4,
        engagementRate: 3.9,
        momentumScore: 68,
        trending: "rising",
        tags: ["nichos youtube", "sin competencia", "youtube 2025"]
    },
    {
        id: "v010",
        title: "How This 19-Year-Old Made $200K Dropshipping With No Experience",
        channel: "EcomEmpire",
        channelAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=EE&backgroundColor=FFB800&textColor=000",
        channelSubs: 89000,
        thumbnail: "https://picsum.photos/seed/ytv10/640/360",
        views: 4_200_000,
        likes: 120000,
        comments: 9800,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 120),
        duration: "20:00",
        language: "en",
        category: "E-commerce",
        vph: 8100,
        avgChannelViews: 520000,
        outlierRatio: 8.1,
        engagementRate: 3.1,
        momentumScore: 62,
        trending: "normal",
        tags: ["dropshipping", "ecommerce", "make money online"]
    },
    {
        id: "v011",
        title: "I Tested Every AI Image Generator — Here's the Winner",
        channel: "PixelMind",
        channelAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=PM&backgroundColor=7B2FFF&textColor=fff",
        channelSubs: 11200,
        thumbnail: "https://picsum.photos/seed/ytv11/640/360",
        views: 1_850_000,
        likes: 62000,
        comments: 5100,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 96),
        duration: "17:28",
        language: "en",
        category: "Inteligencia Artificial",
        vph: 6200,
        avgChannelViews: 95000,
        outlierRatio: 19.5,
        engagementRate: 3.6,
        momentumScore: 59,
        trending: "normal",
        tags: ["ai image", "midjourney", "flux", "image generation"]
    },
    {
        id: "v012",
        title: "La Técnica del Canal Silencioso que Nadie te Cuenta (10M vistas sin subs)",
        channel: "ViralLab ES",
        channelAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=VL&backgroundColor=FF3B5C&textColor=fff",
        channelSubs: 640,
        thumbnail: "https://picsum.photos/seed/ytv12/640/360",
        views: 2_100_000,
        likes: 73000,
        comments: 4900,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 150),
        duration: "23:04",
        language: "es",
        category: "YouTube Automation",
        vph: 3500,
        avgChannelViews: 8000,
        outlierRatio: 262.5,
        engagementRate: 3.7,
        momentumScore: 88,
        trending: "hot",
        tags: ["canal silencioso", "sin rostro", "viral youtube es"]
    }
];

// Utilidades
export const formatViews = (v) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
    return v.toString();
};

export const formatSubs = (s) => {
    if (s >= 1_000_000) return `${(s / 1_000_000).toFixed(1)}M`;
    if (s >= 1_000) return `${(s / 1_000).toFixed(1)}K`;
    return s.toString();
};

export const formatVPH = (v) => {
    if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K/h`;
    return `${v}/h`;
};

export const timeAgo = (date) => {
    const diff = Date.now() - date.getTime();
    const h = Math.floor(diff / (1000 * 60 * 60));
    if (h < 24) return `Hace ${h}h`;
    const d = Math.floor(h / 24);
    return `Hace ${d}d`;
};

export const CATEGORIES = ["Todas", "YouTube Automation", "Finanzas", "Inteligencia Artificial", "Emprendimiento", "E-commerce", "YouTube Growth", "Entretenimiento"];
export const LANGUAGES = ["Todos", "es", "en", "pt"];
export const TRENDING_FILTERS = ["Todos", "fire", "hot", "rising", "normal"];
export const SORT_OPTIONS = ["Momentum Score", "VPH (Vistas/hora)", "Outlier Ratio", "Vistas Totales", "Más recientes"];
