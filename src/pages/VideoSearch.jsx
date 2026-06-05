import { useState, useMemo } from 'react';
import { Wifi, WifiOff, AlertTriangle, Clock } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import VideoCard from '../components/VideoCard';
import FiltersPanel from '../components/FiltersPanel';
import { searchVideos, checkHealth, formatViews } from '../services/api';
import { MOCK_VIDEOS, LANGUAGES, TRENDING_FILTERS } from '../data/mockVideos';

const SORT_OPTIONS = ['Momentum Score', 'VPH (Vistas/hora)', 'Outlier Ratio', 'Vistas Totales'];
const TIME_RANGES = [
    { label: 'Cualquier fecha', value: '' },
    { label: 'Última hora', value: new Date(Date.now() - 3600000).toISOString() },
    { label: 'Hoy', value: new Date(Date.now() - 86400000).toISOString() },
    { label: 'Esta semana', value: new Date(Date.now() - 604800000).toISOString() },
    { label: 'Este mes', value: new Date(Date.now() - 2592000000).toISOString() },
];

const FILTER_OPTIONS = [
    { key: 'language', label: 'Idioma', items: ['', 'es', 'en', 'pt', 'fr', 'de'] },
    { key: 'timeRange', label: 'Rango de tiempo', items: TIME_RANGES.map(t => t.label) },
    { key: 'sort', label: 'Ordenar por', items: SORT_OPTIONS },
];

export default function VideoSearch({ onPlayVideo }) {
    const [query, setQuery] = useState('');
    const [videos, setVideos] = useState([]);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isLive, setIsLive] = useState(false);
    const [meta, setMeta] = useState(null);
    const [error, setError] = useState(null);

    const [filters, setFilters] = useState({
        language: '',
        timeRange: 'Cualquier fecha',
        sort: 'Momentum Score',
    });

    const handleFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }));

    const handleSearch = async (q) => {
        if (!q.trim()) return;
        setQuery(q);
        setSearched(true);
        setLoading(true);
        setError(null);

        const health = await checkHealth();
        if (health.ok && health.keysConfigured > 0) {
            try {
                const timeEntry = TIME_RANGES.find(t => t.label === filters.timeRange);
                const data = await searchVideos({
                    q,
                    max: 20,
                    language: filters.language,
                    publishedAfter: timeEntry?.value || '',
                });
                setVideos(data.videos);
                setMeta(data.meta);
                setIsLive(true);
                setLoading(false);
                return;
            } catch (e) {
                console.warn('Búsqueda real falló:', e.message);
                setError(e.message);
            }
        }

        // Fallback a mock
        const qLower = q.toLowerCase();
        const mockResults = MOCK_VIDEOS.filter(v =>
            v.title.toLowerCase().includes(qLower) ||
            v.channel.toLowerCase().includes(qLower) ||
            v.tags.some(t => t.toLowerCase().includes(qLower)) ||
            v.category.toLowerCase().includes(qLower)
        );
        setVideos(mockResults);
        setMeta({ source: 'Mock Data (offline)' });
        setIsLive(false);
        if (!health.ok) setError('Backend offline. Ejecuta: cd server && npm run dev');
        else if (health.keysConfigured === 0) setError('API Key no configurada');
        setLoading(false);
    };

    // Ordenar localmente
    const sorted = useMemo(() => {
        let vids = [...videos];
        vids.sort((a, b) => {
            if (filters.sort === 'VPH (Vistas/hora)') return (b.vph || 0) - (a.vph || 0);
            if (filters.sort === 'Outlier Ratio') return (b.outlierRatio || 0) - (a.outlierRatio || 0);
            if (filters.sort === 'Vistas Totales') return (b.views || 0) - (a.views || 0);
            return (b.momentumScore || 0) - (a.momentumScore || 0);
        });
        return vids;
    }, [videos, filters.sort]);

    return (
        <div className="page-content">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <h1>🔍 Buscar Videos</h1>
                    {searched && (
                        <span style={{ fontSize: '0.72rem', color: isLive ? 'var(--accent-green)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            {isLive ? <Wifi size={12} /> : <WifiOff size={12} />}
                            {isLive ? 'Datos en tiempo real' : 'Datos demo'}
                        </span>
                    )}
                </div>
                <p>Busca por tema, nicho o keyword. AlgoritmIA analiza los resultados con Momentum Score en tiempo real.</p>
            </div>

            <SearchBar
                placeholder="Ej: 'youtube automation', 'ganar dinero con IA', 'faceless channels'..."
                onSearch={handleSearch}
                initialValue={query}
            />

            {/* Error banner */}
            {error && !loading && (
                <div style={{
                    background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.3)',
                    borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 20,
                    display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem', color: 'var(--accent-yellow)'
                }}>
                    <AlertTriangle size={18} />
                    <span><strong>Usando datos demo.</strong> {error}</span>
                </div>
            )}

            {searched && !loading && (
                <>
                    <FiltersPanel filters={filters} onChange={handleFilter} options={FILTER_OPTIONS} />

                    <div className="section-header">
                        <div className="section-title">
                            <div className="section-dot" />
                            <h2>Resultados para "{query}"</h2>
                        </div>
                        <span className="section-count">{sorted.length} videos</span>
                    </div>

                    {sorted.length > 0 ? (
                        <div className="videos-grid">
                            {sorted.map(v => <VideoCard key={v.id} video={v} onPlay={() => onPlayVideo(v)} />)}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">🤔</div>
                            <h3>Sin resultados</h3>
                            <p>No encontramos videos para <strong>"{query}"</strong>. Intenta con otros términos.</p>
                        </div>
                    )}

                    {meta && (
                        <div style={{ marginTop: 20, padding: '12px 16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            <Clock size={14} />
                            <span>Fuente: {meta.source} · {meta.quotaCost || ''} · Cache: {meta.cacheExpiresIn || 'N/A'}</span>
                        </div>
                    )}
                </>
            )}

            {/* Loading skeleton */}
            {loading && (
                <div className="videos-grid">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="video-card">
                            <div className="skeleton" style={{ width: '100%', aspectRatio: '16/9' }} />
                            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div className="skeleton" style={{ height: 14, width: '80%' }} />
                                <div className="skeleton" style={{ height: 12, width: '50%' }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Initial state */}
            {!searched && !loading && (
                <div className="empty-state" style={{ marginTop: 48 }}>
                    <div className="empty-icon">🧠</div>
                    <h3>Empieza tu análisis</h3>
                    <p>Escribe un tema o keyword. AlgoritmIA buscará en YouTube y calculará el Momentum Score de cada resultado.</p>
                </div>
            )}
        </div>
    );
}
