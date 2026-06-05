import { useState, useMemo, useEffect } from 'react';
import { Flame, TrendingUp, Eye, Zap, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import VideoCard from '../components/VideoCard';
import FiltersPanel from '../components/FiltersPanel';
import { fetchTrending, checkHealth, formatVPH } from '../services/api';
import { MOCK_VIDEOS, CATEGORIES, LANGUAGES, TRENDING_FILTERS } from '../data/mockVideos';

const REGIONS = ['US', 'ES', 'MX', 'AR', 'CO', 'BR', 'GB', 'DE', 'FR', 'JP'];

const FILTER_OPTIONS = [
    { key: 'trending', label: 'Estado', items: TRENDING_FILTERS },
    { key: 'language', label: 'Idioma', items: LANGUAGES },
    { key: 'sort', label: 'Ordenar por', items: ['Momentum Score', 'VPH (Vistas/hora)', 'Outlier Ratio', 'Vistas Totales'] },
];

export default function Dashboard({ onPlayVideo }) {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLive, setIsLive] = useState(false);
    const [meta, setMeta] = useState(null);
    const [region, setRegion] = useState('US');

    const [filters, setFilters] = useState({
        trending: 'Todos',
        language: 'Todos',
        sort: 'Momentum Score',
    });

    const handleFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }));

    // Cargar datos
    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            setError(null);

            // Verificar si el backend está vivo
            const health = await checkHealth();
            if (!cancelled && health.ok && health.keysConfigured > 0) {
                try {
                    const data = await fetchTrending({ region, max: 24 });
                    if (!cancelled) {
                        setVideos(data.videos);
                        setMeta(data.meta);
                        setIsLive(true);
                        setLoading(false);
                    }
                    return;
                } catch (e) {
                    console.warn('API real falló, usando mock:', e.message);
                }
            }

            // Fallback a datos mock
            if (!cancelled) {
                setVideos(MOCK_VIDEOS);
                setMeta({ source: 'Mock Data (offline)', fetchedAt: new Date().toISOString() });
                setIsLive(false);
                if (!health.ok) {
                    setError('Backend offline. Ejecuta: cd server && npm run dev');
                } else if (health.keysConfigured === 0) {
                    setError('API Key no configurada. Copia server/.env.example a server/.env');
                }
                setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, [region]);

    // Filtrar y ordenar
    const filtered = useMemo(() => {
        let vids = [...videos];
        if (filters.trending !== 'Todos') vids = vids.filter(v => v.trending === filters.trending);
        if (filters.language !== 'Todos') vids = vids.filter(v => v.language === filters.language);
        vids.sort((a, b) => {
            if (filters.sort === 'VPH (Vistas/hora)') return b.vph - a.vph;
            if (filters.sort === 'Outlier Ratio') return b.outlierRatio - a.outlierRatio;
            if (filters.sort === 'Vistas Totales') return b.views - a.views;
            return b.momentumScore - a.momentumScore;
        });
        return vids;
    }, [filters, videos]);

    // Stats globales
    const totalVPH = videos.reduce((s, v) => s + (v.vph || 0), 0);
    const topScore = videos.length ? Math.max(...videos.map(v => v.momentumScore || 0)) : 0;
    const fireCount = videos.filter(v => v.trending === 'fire').length;

    return (
        <div className="page-content">
            {/* Page Header */}
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <h1>🔥 Trending Ahora</h1>
                    <div className="trending-pill" style={isLive ? {} : { borderColor: 'rgba(136,136,170,0.4)', color: 'var(--text-muted)', background: 'rgba(136,136,170,0.08)' }}>
                        <div className="live-dot" style={isLive ? {} : { background: 'var(--text-muted)', animation: 'none' }} />
                        {isLive ? 'EN VIVO' : 'OFFLINE'}
                    </div>
                    {isLive && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Wifi size={12} /> YouTube Data API v3
                        </span>
                    )}
                </div>
                <p>
                    {isLive
                        ? `Videos trending en ${region} con Momentum Score calculado en tiempo real.`
                        : 'Videos con mayor potencial viral. Conecta el backend para datos en tiempo real.'
                    }
                    {meta?.fetchedAt && (
                        <span style={{ marginLeft: 8, color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                            · Actualizado: {new Date(meta.fetchedAt).toLocaleTimeString('es')}
                        </span>
                    )}
                </p>
            </div>

            {/* Error Banner */}
            {error && (
                <div style={{
                    background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.3)',
                    borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 20,
                    display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem', color: 'var(--accent-yellow)'
                }}>
                    <AlertTriangle size={18} />
                    <div>
                        <strong>Usando datos de demostración.</strong> {error}
                    </div>
                </div>
            )}

            {/* Region Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>REGIÓN:</span>
                <div className="tab-nav">
                    {REGIONS.map(r => (
                        <button key={r} className={`tab-btn${region === r ? ' active' : ''}`} onClick={() => setRegion(r)}>
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Row */}
            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-label">Videos Analizados</div>
                    <div className="stat-value">{videos.length}</div>
                    <div className={`stat-delta ${isLive ? 'up' : ''}`}>
                        {isLive ? <Wifi size={12} /> : <WifiOff size={12} />}
                        {isLive ? 'En tiempo real' : 'Datos demo'}
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">VPH Total Rastreado</div>
                    <div className="stat-value">{formatVPH(totalVPH)}</div>
                    <div className="stat-delta up"><Zap size={12} /> Velocidad activa</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Videos en Llamas 🔥</div>
                    <div className="stat-value" style={{ color: 'var(--accent-red)' }}>{fireCount}</div>
                    <div className="stat-delta up"><Flame size={12} /> Score &gt; 85</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Momentum Score Máx.</div>
                    <div className="stat-value" style={{ color: 'var(--accent-purple-light)' }}>{topScore}</div>
                    <div className="stat-delta up"><Eye size={12} /> Hoy en el top</div>
                </div>
            </div>

            {/* Filters */}
            <FiltersPanel filters={filters} onChange={handleFilter} options={FILTER_OPTIONS} />

            {/* Section Header */}
            <div className="section-header">
                <div className="section-title">
                    <div className="section-dot" />
                    <h2>Videos Trending {region}</h2>
                </div>
                <span className="section-count">{filtered.length} resultados</span>
            </div>

            {/* Loading */}
            {loading ? (
                <div className="videos-grid">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="video-card">
                            <div className="skeleton" style={{ width: '100%', aspectRatio: '16/9' }} />
                            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div className="skeleton" style={{ height: 14, width: '80%' }} />
                                <div className="skeleton" style={{ height: 12, width: '50%' }} />
                                <div className="skeleton" style={{ height: 10, width: '40%' }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filtered.length > 0 ? (
                <div className="videos-grid">
                    {filtered.map(v => <VideoCard key={v.id} video={v} onPlay={() => onPlayVideo(v)} />)}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon">🔍</div>
                    <h3>Sin resultados</h3>
                    <p>Ajusta los filtros para ver videos trending en este segmento.</p>
                </div>
            )}
        </div>
    );
}
