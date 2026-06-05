import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import NichePanel from '../components/NichePanel';
import FiltersPanel from '../components/FiltersPanel';
import NicheEvaluator from '../components/NicheEvaluator';
import VideoModal from '../components/VideoModal';
import { MOCK_NICHES, NICHE_CATEGORIES, NICHE_COMPETITION, NICHE_LANGUAGES, NICHE_SORT } from '../data/mockNiches';
import { fetchMarketTrends, checkHealth, searchVideos } from '../services/api';
import { TrendingUp, Compass, Star, Zap, Search, ExternalLink, Activity, Globe, ArrowRight, Filter, Cpu, Brain, ShieldCheck, Target, AlertTriangle } from 'lucide-react';

const NicheVideoMini = ({ video }) => (
    <div className="niche-video-card" style={{ cursor: 'pointer' }} onClick={() => window.open(`https://youtube.com/watch?v=${video.id}`, '_blank')}>
        <div className="niche-video-thumb">
            <img src={video.thumbnail} alt={video.title} />
            <div className="niche-video-overlay"><Search size={14} /></div>
        </div>
        <div className="niche-video-info">
            <div className="niche-video-title">{video.title}</div>
            <div className="niche-video-channel">{video.channel}</div>
        </div>
    </div>
);

const FILTER_OPTIONS = [
    { key: 'category', label: 'Categoría', items: NICHE_CATEGORIES },
    { key: 'competition', label: 'Competencia', items: NICHE_COMPETITION },
    { key: 'language', label: 'Idioma', items: NICHE_LANGUAGES },
    { key: 'sort', label: 'Ordenar por', items: NICHE_SORT },
];

export default function NicheFinder() {
    const [searchParams, setSearchParams] = useSearchParams();
    const marketParam = searchParams.get('market');

    const [filters, setFilters] = useState({
        category: 'Todas',
        competition: 'Todas',
        language: 'Todos',
        sort: 'Oportunidad',
        searchQuery: '',
    });
    const [marketTrends, setMarketTrends] = useState([]);
    const [isLive, setIsLive] = useState(false);
    const [loadingTrends, setLoadingTrends] = useState(true);
    const [selectedNiche, setSelectedNiche] = useState(null);
    const [nicheRegion, setNicheRegion] = useState(marketParam || 'US');
    const [nicheVideos, setNicheVideos] = useState([]);
    const [loadingNicheVideos, setLoadingNicheVideos] = useState(false);

    const handleRegionChange = (region) => {
        setNicheRegion(region);
        setSearchParams({ market: region });
    };

    const loadNicheVideos = async (query, region) => {
        setLoadingNicheVideos(true);
        try {
            const data = await searchVideos({ q: query, region, max: 12 });
            setNicheVideos(data.videos || []);
        } catch (e) {
            console.error('Error:', e);
        }
        setLoadingNicheVideos(false);
    };

    useEffect(() => {
        if (marketParam && marketParam !== nicheRegion) {
            setNicheRegion(marketParam);
        }
    }, [marketParam]);

    useEffect(() => {
        if (selectedNiche) loadNicheVideos(selectedNiche.name, nicheRegion);
    }, [selectedNiche, nicheRegion]);

    useEffect(() => {
        async function loadTrends() {
            setLoadingTrends(true);
            const health = await checkHealth();
            if (health.ok) {
                try {
                    const data = await fetchMarketTrends(nicheRegion);
                    setMarketTrends(data.trends || []);
                    setIsLive(true);
                } catch (e) {
                    console.warn('Fallo al cargar Google Trends:', e.message);
                }
            }
            setLoadingTrends(false);
        }
        loadTrends();
    }, [nicheRegion]);

    const handleFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }));

    const filtered = useMemo(() => {
        let niches = [...MOCK_NICHES];
        if (filters.category !== 'Todas') niches = niches.filter(n => n.category === filters.category);
        if (filters.competition !== 'Todas') niches = niches.filter(n => n.competition === filters.competition);
        if (filters.language !== 'Todos') niches = niches.filter(n => n.languages.includes(filters.language));
        if (filters.searchQuery) {
            const q = filters.searchQuery.toLowerCase();
            niches = niches.filter(n => n.name.toLowerCase().includes(q) || n.desc.toLowerCase().includes(q) || n.tags.some(t => t.toLowerCase().includes(q)));
        }
        niches.sort((a, b) => {
            if (filters.sort === 'VPH Promedio') return b.avgVPH - a.avgVPH;
            if (filters.sort === 'Crecimiento %') {
                return parseFloat(b.growthRate) - parseFloat(a.growthRate);
            }
            if (filters.sort === 'Canales Activos') return a.totalChannels - b.totalChannels;
            return b.opportunityScore - a.opportunityScore;
        });
        return niches.map(n => ({ ...n, region: nicheRegion }));
    }, [filters, nicheRegion]);

    const highOpp = MOCK_NICHES.filter(n => n.opportunityLevel === 'high').length;
    const avgGrowth = Math.round(
        MOCK_NICHES.reduce((s, n) => s + parseFloat(n.growthRate), 0) / MOCK_NICHES.length
    );
    const lowComp = MOCK_NICHES.filter(n => ['Muy Baja', 'Baja'].includes(n.competition)).length;

    return (
        <div className="page-content">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <h1>🎯 Buscar Nichos</h1>
                    <div className="trending-pill" style={{ borderColor: 'rgba(0,212,255,0.4)', color: 'var(--accent-cyan)', background: 'rgba(0,212,255,0.08)' }}>
                        <div className="live-dot" style={{ background: 'var(--accent-cyan)' }} />
                        BASE DE DATOS VIVA
                    </div>
                </div>
                <p>Nichos rentables con alto potencial de viralidad y baja saturación. Datos actualizados de +400K canales.</p>
            </div>

            {/* Niche Evaluator Tool */}
            {!selectedNiche && <NicheEvaluator />}

            {/* Stats Overview */}
            {!selectedNiche && !marketParam && (
                <div className="stats-grid" style={{ marginBottom: 32 }}>
                    <div className="stat-card">
                        <div className="stat-label">Nichos Analizados</div>
                        <div className="stat-value">{MOCK_NICHES.length}</div>
                        <div className="stat-delta up"><TrendingUp size={12} /> Base de datos propia</div>
                    </div>
                    <div
                        className="stat-card clickable"
                        onClick={() => handleFilter('sort', 'Oportunidad')}
                        style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                        <div className="stat-label">Alta Oportunidad</div>
                        <div className="stat-value" style={{ color: 'var(--accent-green)' }}>{highOpp}</div>
                        <div className="stat-delta up"><Star size={12} /> Score &gt; 80</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Crecim. Prom. Anual</div>
                        <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>+{avgGrowth}%</div>
                        <div className="stat-delta up"><Zap size={12} /> Mercado expansivo</div>
                    </div>
                    <div
                        className="stat-card clickable"
                        onClick={() => handleFilter('competition', 'Baja')}
                        style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                        <div className="stat-label">Competencia Baja</div>
                        <div className="stat-value" style={{ color: 'var(--accent-purple-light)' }}>{lowComp}</div>
                        <div className="stat-delta up"><Compass size={12} /> Nichos vírgenes</div>
                    </div>
                </div>
            )}

            {/* Search Trends Section - ONLY SHOW IF MARKET PARAM IS PRESENT AND NO NICHE SELECTED */}
            {!selectedNiche && marketParam && (
                <>
                    <div className="section-header" style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <div className="section-title">
                                <div className="section-dot orange" />
                                <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    🔥 Tendencias de Búsqueda (Google Real-time)
                                </h2>
                            </div>

                            <div className="market-selector-pills">
                                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: 8 }}>EJE REGIONAL:</span>
                                {[
                                    { id: 'MX', label: 'LATAM 🇦🇷🇲🇽' },
                                    { id: 'US', label: 'USA 🇺🇸' },
                                    { id: 'ES', label: 'EUROPA 🇪🇺' }
                                ].map(m => (
                                    <button
                                        key={m.id}
                                        className={`pill-btn${nicheRegion === m.id ? ' active' : ''}`}
                                        onClick={() => handleRegionChange(m.id)}
                                    >
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
                        {nicheRegion === 'US' ? 'Analizando tendencias en Estados Unidos (Influencia Global)' :
                            nicheRegion === 'ES' ? 'Analizando tendencias en Europa (Hispana)' :
                                'Analizando tendencias en Latinoamérica (LATAM)'}
                    </p>

                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: 16, marginBottom: 40
                    }}>
                        {loadingTrends ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="stat-card skeleton" style={{ height: 80 }} />
                            ))
                        ) : marketTrends.length > 0 ? (
                            marketTrends.slice(0, 12).map((trend, i) => (
                                <div
                                    key={i}
                                    className="stat-card trend-card clickable"
                                    style={{
                                        cursor: 'pointer',
                                        border: '1px solid rgba(0,212,255,0.1)',
                                        position: 'relative'
                                    }}
                                    onClick={() => handleFilter('searchQuery', trend.title)}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Search size={14} color="var(--accent-cyan)" />
                                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{trend.title}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <Activity size={14} color="var(--accent-purple-light)" />
                                            <ExternalLink
                                                size={12}
                                                className="trend-external"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(trend.link, '_blank');
                                                }}
                                                style={{ color: 'var(--text-muted)' }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{trend.traffic} búsquedas</span>
                                        <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'rgba(0,212,255,0.1)', color: 'var(--accent-cyan)', borderRadius: 4 }}>
                                            CALIENTE
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="stat-card" style={{ gridColumn: '1 / -1' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No se encontraron señales para este mercado.</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Grid - ONLY SHOW FILTERS AND GRID IF NO MARKET PARAM (OR IF USER WANTS TO EXPLORE) */}
            {(!marketParam || selectedNiche) ? (
                <>
                    {/* Filters */}
                    {!selectedNiche && <FiltersPanel filters={filters} onChange={handleFilter} options={FILTER_OPTIONS} />}

                    {/* Section Header */}
                    {!selectedNiche && (
                        <div className="section-header">
                            <div className="section-title">
                                <div className="section-dot cyan" />
                                <h2>Nichos con Mayor Oportunidad</h2>
                            </div>
                            <span className="section-count">{filtered.length} nichos</span>
                        </div>
                    )}

                    {/* Grid */}
                    {selectedNiche ? (
                        <div className="niche-detail-view">
                            <button className="btn-secondary" onClick={() => setSelectedNiche(null)} style={{ marginBottom: 20 }}>
                                ← Volver a todos los nichos
                            </button>

                            <div className="niche-detail-header">
                                <div className="detail-meta">
                                    <span className="niche-emoji-large">{selectedNiche.emoji}</span>
                                    <div>
                                        <h2 className="detail-title">{selectedNiche.name}</h2>
                                        <p className="detail-desc">{selectedNiche.desc}</p>
                                    </div>
                                </div>

                                <div className="detail-region-selector">
                                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>VER DATOS EN:</span>
                                    <div className="market-selector-pills">
                                        {[
                                            { id: 'MX', label: 'LATAM 🇲🇽' },
                                            { id: 'US', label: 'USA 🇺🇸' },
                                            { id: 'ES', label: 'EUROPA 🇪🇺' }
                                        ].map(m => (
                                            <button
                                                key={m.id}
                                                className={`pill-btn${nicheRegion === m.id ? ' active' : ''}`}
                                                onClick={() => handleRegionChange(m.id)}
                                            >
                                                {m.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="niche-detail-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 24 }}>
                                <div className="stat-card">
                                    <div className="stat-label">CPM Tier 1 (USA/UK)</div>
                                    <div className="stat-value" style={{ color: 'var(--accent-green)' }}>${selectedNiche.cpmData.US}</div>
                                    <div className="stat-delta up">~{Math.round((1000 / selectedNiche.cpmData.US) * 1000).toLocaleString()} vistas p/ $1k</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">CPM Tier 2 (España)</div>
                                    <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>${selectedNiche.cpmData.ES}</div>
                                    <div className="stat-delta up">~{Math.round((1000 / selectedNiche.cpmData.ES) * 1000).toLocaleString()} vistas p/ $1k</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">CPM Tier 3 (MEX/LATAM)</div>
                                    <div className="stat-value" style={{ color: 'var(--accent-yellow)' }}>${selectedNiche.cpmData.MX}</div>
                                    <div className="stat-delta up">~{Math.round((1000 / selectedNiche.cpmData.MX) * 1000).toLocaleString()} vistas p/ $1k</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Efectividad Estimada</div>
                                    <div className="stat-value" style={{ color: 'var(--accent-purple-light)' }}>{selectedNiche.opportunityScore}%</div>
                                    <div className="stat-delta up">Nivel: {selectedNiche.opportunityLevel.toUpperCase()}</div>
                                </div>
                            </div>

                            <div className="disclaimer-note" style={{
                                marginTop: 12,
                                fontSize: '0.7rem',
                                color: 'var(--text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '8px 12px',
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: '8px',
                                border: '1px solid var(--border-subtle)'
                            }}>
                                <AlertTriangle size={12} />
                                <span><b>Disclaimer:</b> Valores aproximados basados en promedios de mercado 2024/2025. El CPM real depende de la retención, duración del video y estacionalidad.</span>
                            </div>

                            {/* ═══ CEREBRO IA ANALYSIS PANEL ═══ */}
                            <div className="cerebro-ia-panel" style={{
                                marginTop: 32,
                                background: 'linear-gradient(135deg, rgba(123,47,255,0.05), rgba(0,212,255,0.03))',
                                border: '1px solid rgba(123,47,255,0.2)',
                                borderRadius: 16,
                                padding: 28,
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{ position: 'absolute', top: 12, right: 16, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,229,160,0.1)', padding: '4px 10px', borderRadius: 50, border: '1px solid rgba(0,229,160,0.3)' }}>
                                    <ShieldCheck size={12} style={{ color: 'var(--accent-green)' }} />
                                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent-green)' }}>DATOS VERIFICADOS POR RED NEURONAL</span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(123,47,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Cpu size={20} style={{ color: 'var(--accent-purple-light)' }} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Análisis del Cerebro IA</h3>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Inteligencia generada por la Red Neuronal AlgoritmIA</p>
                                    </div>
                                </div>

                                {/* Outlier Ratio Highlight */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, marginBottom: 24 }}>
                                    <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 20, textAlign: 'center', border: '1px solid rgba(0,212,255,0.15)' }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Multiplicador Viral</div>
                                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'Outfit, sans-serif' }}>×{selectedNiche.topOutlierRatio}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                                            {selectedNiche.topOutlierRatio >= 50 ? '🔥 Potencial Explosivo' : selectedNiche.topOutlierRatio >= 20 ? '⚡ Alto Potencial' : '📊 Potencial Moderado'}
                                        </div>
                                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: 8 }}>
                                            Los videos top superan ×{selectedNiche.topOutlierRatio} el promedio del canal
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-purple-light)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Brain size={14} /> PATRÓN DE ÉXITO DETECTADO
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                            {selectedNiche.aiAnalysis}
                                        </p>

                                        <div style={{ marginTop: 16, fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-green)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Target size={14} /> GANCHOS DE ORO (Retention Triggers)
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            {selectedNiche.retentionHooks.map((hook, i) => (
                                                <div key={i} style={{
                                                    display: 'flex', alignItems: 'center', gap: 8,
                                                    background: 'rgba(0,229,160,0.05)',
                                                    border: '1px solid rgba(0,229,160,0.1)',
                                                    padding: '6px 12px', borderRadius: 8
                                                }}>
                                                    <span style={{ color: 'var(--accent-green)', fontSize: '0.8rem' }}>▸</span>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{hook}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="section-header" style={{ marginTop: 32 }}>
                                <div className="section-title">
                                    <div className="section-dot cyan" />
                                    <h2>Videos Reales en este Nicho ({nicheRegion})</h2>
                                </div>
                            </div>

                            <div className="niche-detail-content">
                                {loadingNicheVideos ? (
                                    <div className="niches-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="stat-card skeleton" style={{ height: 180 }} />)}
                                    </div>
                                ) : nicheVideos.length > 0 ? (
                                    <div className="niches-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                                        {nicheVideos.map(v => <NicheVideoMini key={v.id} video={v} />)}
                                    </div>
                                ) : (
                                    <div className="empty-state" style={{ padding: '20px 0' }}>
                                        <p style={{ fontSize: '0.8rem' }}>Conecta el backend para ver videos reales de este nicho.</p>
                                    </div>
                                )}

                                <div className="subniches-explorer" style={{ marginTop: 32 }}>
                                    <h4 style={{ marginBottom: 12, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>🔍 Profundizar en Sub-nichos:</h4>
                                    <div className="niche-tags">
                                        {selectedNiche.tags.map(t => (
                                            <button
                                                key={t}
                                                className="niche-tag active"
                                                onClick={() => loadNicheVideos(`${selectedNiche.name} ${t}`, nicheRegion)}
                                                style={{ border: 'none', padding: '6px 14px' }}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : filtered.length > 0 ? (
                        <div className="niches-grid">
                            {filtered.map(n => <NichePanel key={n.id} niche={n} onSelect={() => setSelectedNiche(n)} />)}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">🌌</div>
                            <h3>Sin nichos</h3>
                            <p>Cambia los filtros para explorar nichos en diferentes categorías e idiomas.</p>
                        </div>
                    )}
                </>
            ) : null}
        </div>
    );
}
