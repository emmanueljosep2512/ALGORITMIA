import { useState, useEffect, useMemo } from 'react';
import { Instagram, Facebook, Search, Flame, TrendingUp, Cpu, Zap, Copy, Check, ExternalLink, Activity, Play, Heart, MessageSquare, Share2, Sparkles, AlertTriangle, Layers, FileText, Brain } from 'lucide-react';
import { searchMetaReels, fetchMetaAds, generateMetaCopy, formatViews, timeAgo, analyzeMetaReel } from '../services/api';

const NICHE_CATEGORIES = ['Todas', 'Tecnología', 'Finanzas', 'Salud / Fitness', 'Estilo de vida'];

const getDefaultReelAnalysis = (reel) => {
    const outlier = reel.outlierRatio || (1.5 + (reel.views ? (reel.likes % 5) : 3) * 2).toFixed(1);
    return `### 📈 FACTORES DE ÉXITO DE ESTE REEL
- **Intriga en el gancho:** El título "${reel.title}" apela directamente a una curiosidad no resuelta en los primeros 3 segundos.
- **Relación de Outlier:** Este Reel rinde notablemente mejor que el promedio del canal, indicando que el nicho de ${reel.niche || 'General'} tiene una alta tracción actual.

### 🎯 ÁNGULO Y AUDIO VIRAL
- **Estructura visual rápida:** Uso de clips de 1.5 a 2 segundos para mantener la retención alta y evitar saltos.
- **Llamado a la acción implícito:** Invita a guardar el video para verlo más tarde, lo cual dispara el algoritmo de Instagram.

### 💡 ESTRUCTURA PARA REPLICAR (BAJO 60 SEG)
| Estímulo Visual (Pantalla) | Narración / Audio (Voz en Off) |
| --- | --- |
| Texto llamativo sobre fondo contrastado | "Este es el mayor secreto que la gente de ${reel.theme || 'este nicho'} oculta..." |
| Transición rápida de clips demostrativos | "Muchos creen que se necesita tiempo, pero la realidad es otra..." |
| Captura de pantalla del método en acción | "Solo tienes que seguir estos tres pasos simples..." |
| Botón animado de seguir y comentar | "Si quieres la guía completa, comenta la palabra INFO abajo." |`;
};

const renderReelAnalysisMarkdown = (text) => {
    if (!text) return null;
    const sections = text.split(/###\s+/);
    return sections.map((sec, idx) => {
        if (!sec.trim()) return null;
        const lines = sec.split('\n');
        const title = lines[0].trim();
        const rest = lines.slice(1).join('\n').trim();

        if (title.includes('FACTORES')) {
            return (
                <div key={idx} style={{
                    background: 'rgba(78, 204, 163, 0.05)',
                    border: '1px solid rgba(78, 204, 163, 0.2)',
                    borderRadius: '16px',
                    padding: '18px',
                    marginBottom: '20px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green)', fontWeight: '800', fontSize: '0.9rem', marginBottom: '8px' }}>
                        <TrendingUp size={16} /> {title}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        {rest.split('\n').map((l, i) => (
                            <p key={i} style={{ marginBottom: '6px' }}>{l}</p>
                        ))}
                    </div>
                </div>
            );
        }

        if (title.includes('ÁNGULO') || title.includes('AUDIO')) {
            return (
                <div key={idx} style={{
                    background: 'rgba(225, 48, 108, 0.05)',
                    border: '1px solid rgba(225, 48, 108, 0.2)',
                    borderRadius: '16px',
                    padding: '18px',
                    marginBottom: '20px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e1306c', fontWeight: '800', fontSize: '0.9rem', marginBottom: '8px' }}>
                        <Zap size={16} /> {title}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        {rest.split('\n').map((l, i) => (
                            <p key={i} style={{ marginBottom: '6px' }}>{l}</p>
                        ))}
                    </div>
                </div>
            );
        }

        if (title.includes('ESTRUCTURA')) {
            const rows = rest.split('\n').filter(r => r.includes('|') && !r.includes('---'));
            const tableBody = rows.slice(1).map(r => r.split('|').map(cell => cell.trim()).filter(Boolean));
            return (
                <div key={idx} style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-purple-light)', fontWeight: '800', fontSize: '0.9rem', marginBottom: '10px' }}>
                        <Layers size={16} /> {title}
                    </div>
                    <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-subtle)' }}>
                                    <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>Pantalla (Visual)</th>
                                    <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>Audio (Voz en Off)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableBody.map((row, i) => (
                                    <tr key={i} style={{ borderBottom: i < tableBody.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                        <td style={{ padding: '10px 14px', color: 'var(--text-primary)', fontWeight: '500' }}>{row ? row[0] : ''}</td>
                                        <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>{row ? row[1] : ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        return (
            <div key={idx} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', fontWeight: '800', fontSize: '0.9rem', marginBottom: '8px' }}>
                    <FileText size={16} /> {title}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {rest}
                </div>
            </div>
        );
    });
};

export default function MetaIntelligence() {
    const [activeTab, setActiveTab] = useState('reels'); // 'reels' | 'ads' | 'copywriter'
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');
    
    // Reels State
    const [reels, setReels] = useState([]);
    const [loadingReels, setLoadingReels] = useState(false);
    const [selectedReel, setSelectedReel] = useState(null);
    const [errorReels, setErrorReels] = useState('');

    // Ads State
    const [ads, setAds] = useState([]);
    const [loadingAds, setLoadingAds] = useState(false);

    // Copywriter State
    const [nicheInput, setNicheInput] = useState('');
    const [selectedPlatform, setSelectedPlatform] = useState('Instagram');
    const [selectedType, setSelectedType] = useState('Reel Script');
    const [aiContent, setAiContent] = useState('');
    const [generatingCopy, setGeneratingCopy] = useState(false);
    const [copied, setCopied] = useState(false);

    // Cargar Reels
    const loadReels = async () => {
        setLoadingReels(true);
        setErrorReels('');
        try {
            const isUrl = searchQuery.trim().startsWith('http') || 
                          searchQuery.includes('instagram.com') || 
                          searchQuery.includes('facebook.com');

            if (isUrl) {
                const data = await analyzeMetaReel(searchQuery.trim());
                if (data && data.reel) {
                    const newReel = {
                        ...data.reel,
                        analysis: data.analysis
                    };
                    setReels([newReel]);
                    setSelectedReel(newReel);
                } else {
                    setErrorReels('No se pudo analizar este enlace. Asegúrate de que sea un enlace público de Instagram Reel.');
                }
            } else {
                const data = await searchMetaReels({ q: searchQuery, category: selectedCategory });
                setReels(data.reels || []);
            }
        } catch (e) {
            console.error('Error loading reels:', e);
            setErrorReels('Error al analizar este Reel. Asegúrate de que el enlace sea de un Reel público de Instagram.');
        }
        setLoadingReels(false);
    };

    // Cargar Anuncios
    const loadAds = async () => {
        setLoadingAds(true);
        try {
            const data = await fetchMetaAds({ q: searchQuery, category: selectedCategory });
            setAds(data.ads || []);
        } catch (e) {
            console.error('Error loading ads:', e);
        }
        setLoadingAds(false);
    };

    // Generar Copy con IA
    const generateCopy = async () => {
        if (!nicheInput.trim()) return;
        setGeneratingCopy(true);
        setAiContent('');
        try {
            const data = await generateMetaCopy({
                niche: nicheInput,
                platform: selectedPlatform,
                type: selectedType
            });
            setAiContent(data.content || 'No se pudo generar contenido.');
        } catch (e) {
            console.error('Error generating copy:', e);
            setAiContent('Ocurrió un error al conectar con el Cerebro IA.');
        }
        setGeneratingCopy(false);
    };

    useEffect(() => {
        if (activeTab === 'reels') {
            loadReels();
        } else if (activeTab === 'ads') {
            loadAds();
        }
    }, [activeTab, selectedCategory]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (activeTab === 'reels') loadReels();
        if (activeTab === 'ads') loadAds();
    };

    const handleCopy = () => {
        if (!aiContent) return;
        navigator.clipboard.writeText(aiContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Formatear texto de Markdown simple del Copywriter para que se vea premium en UI
    const renderedAiContent = useMemo(() => {
        if (!aiContent) return null;
        
        // Dividir por secciones principales
        const sections = aiContent.split(/###\s+/);
        
        return sections.map((sec, idx) => {
            if (!sec.trim()) return null;
            
            const lines = sec.split('\n');
            const title = lines[0].trim();
            const rest = lines.slice(1).join('\n').trim();

            if (title.includes('GANCHO')) {
                return (
                    <div key={idx} className="ai-section gancho-card" style={{
                        background: 'linear-gradient(135deg, rgba(225, 48, 108, 0.1), rgba(123, 47, 255, 0.08))',
                        border: '1px solid rgba(225, 48, 108, 0.25)',
                        borderRadius: '16px',
                        padding: '20px',
                        marginBottom: '24px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e1306c', fontWeight: '800', fontSize: '0.95rem', marginBottom: '10px' }}>
                            <Sparkles size={16} /> {title}
                        </div>
                        <div style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                            {rest.split('\n').map((l, i) => (
                                <p key={i} style={{ marginBottom: '6px' }}>{l.replace(/^-\s+\*\*V(isual|oz en Off\s*\/\s*Texto):\*\*/, '').replace(/^\*/, '')}</p>
                            ))}
                        </div>
                    </div>
                );
            }

            if (title.includes('ESTRUCTURA')) {
                // Parsear tabla markdown
                const rows = rest.split('\n').filter(r => r.includes('|') && !r.includes('---'));
                const tableBody = rows.slice(1).map(r => r.split('|').map(cell => cell.trim()).filter(Boolean));

                return (
                    <div key={idx} className="ai-section structure-card" style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-purple-light)', fontWeight: '800', fontSize: '0.95rem', marginBottom: '12px' }}>
                            <Layers size={16} /> {title}
                        </div>
                        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-subtle)' }}>
                                        <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>Estímulo Visual (Pantalla)</th>
                                        <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>Audio / Narración (Voz en Off)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableBody.map((row, i) => (
                                        <tr key={i} style={{ borderBottom: i < tableBody.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                            <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: '500' }}>{row[0]}</td>
                                            <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{row[1]}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            }

            return (
                <div key={idx} className="ai-section copy-card" style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', fontWeight: '800', fontSize: '0.95rem', marginBottom: '12px' }}>
                        <FileText size={16} /> {title}
                    </div>
                    <div style={{
                        whiteSpace: 'pre-line',
                        fontSize: '0.88rem',
                        lineHeight: '1.6',
                        color: 'var(--text-secondary)',
                        padding: '16px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '12px'
                    }}>
                        {rest}
                    </div>
                </div>
            );
        });
    }, [aiContent]);

    return (
        <div className="page-content">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                        <h1 style={{ background: 'linear-gradient(45deg, #e1306c, #1877F2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline' }}>
                            ♾️ IG & FB Intelligence
                        </h1>
                        <span className="trending-pill" style={{
                            background: 'rgba(225, 48, 108, 0.1)',
                            border: '1px solid rgba(225, 48, 108, 0.25)',
                            color: '#e1306c',
                            fontSize: '0.65rem'
                        }}>
                            META ALGORITHM v2
                        </span>
                    </div>
                    <p>Espía tendencias de Reels de Instagram, analiza creativos de anuncios y redacta copys con el Cerebro IA.</p>
                </div>
            </div>

            {/* Selector de Pestañas */}
            <div className="tab-nav" style={{ marginBottom: '28px' }}>
                <button
                    className={`tab-btn ${activeTab === 'reels' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reels')}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Instagram size={14} /> Reels Analyzer
                </button>
                <button
                    className={`tab-btn ${activeTab === 'ads' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ads')}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Facebook size={14} /> Ad Spy (Biblioteca)
                </button>
                <button
                    className={`tab-btn ${activeTab === 'copywriter' ? 'active' : ''}`}
                    onClick={() => setActiveTab('copywriter')}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Sparkles size={14} /> Cerebro Copywriter
                </button>
            </div>

            {/* Panel de Filtros y Búsqueda (Solo para Reels y Ads) */}
            {activeTab !== 'copywriter' && (
                <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
                    <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: '280px' }}>
                        <div className="search-wrapper">
                            <Search className="search-icon" size={18} />
                            <input
                                type="text"
                                className="search-input"
                                placeholder={activeTab === 'reels' ? "Buscar Reels por nicho o creador..." : "Buscar anuncios en circulación..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </form>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {NICHE_CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                className={`pill-btn ${selectedCategory === cat ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat)}
                                style={{
                                    background: selectedCategory === cat ? 'linear-gradient(45deg, #e1306c, #bc1888)' : 'rgba(255,255,255,0.05)',
                                    borderColor: selectedCategory === cat ? 'transparent' : 'var(--border-subtle)'
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB: REELS ANALYZER */}
            {activeTab === 'reels' && (
                <>
                    {errorReels && (
                        <div style={{
                            background: 'rgba(255,80,80,0.1)',
                            border: '1px solid rgba(255,80,80,0.25)',
                            borderRadius: '12px',
                            padding: '16px',
                            color: '#ff5050',
                            fontSize: '0.85rem',
                            marginBottom: '20px'
                        }}>
                            ⚠️ {errorReels}
                        </div>
                    )}
                    {loadingReels ? (
                    <div className="niches-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="stat-card skeleton" style={{ height: '380px', borderRadius: '16px' }} />
                        ))}
                    </div>
                ) : (
                    <div className="niches-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                        {reels.map(reel => (
                            <div
                                key={reel.id}
                                className="niche-card"
                                onClick={() => setSelectedReel(reel)}
                                style={{
                                    padding: 0,
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    height: '380px',
                                    position: 'relative',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                {/* Thumbnail en proporción 9:16 vertical */}
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    backgroundImage: `url(${reel.thumbnail})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    zIndex: 1
                                }} />
                                
                                {/* Overlay Oscuro de Degradado */}
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.85) 100%)',
                                    zIndex: 2
                                }} />

                                {/* Contenido Flotante Arriba (Creador) */}
                                <div style={{
                                    position: 'absolute',
                                    top: '12px',
                                    left: '12px',
                                    right: '12px',
                                    zIndex: 3,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <img
                                        src={reel.channelAvatar}
                                        alt={reel.channel}
                                        style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1.5px solid #fff' }}
                                    />
                                    <span style={{ fontSize: '0.75rem', fontWeight: '700', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                                        @{reel.channel}
                                    </span>

                                    {/* Momentum Badge */}
                                    <div className={`momentum-badge ${reel.trending}`} style={{
                                        position: 'static',
                                        marginLeft: 'auto',
                                        padding: '2px 8px',
                                        fontSize: '0.62rem',
                                        background: reel.trending === 'fire' ? 'rgba(255, 59, 92, 0.95)' : 'rgba(0, 212, 255, 0.95)'
                                    }}>
                                        ⚡ {reel.momentumScore}%
                                    </div>
                                </div>

                                {/* Play Overlay central al hacer hover */}
                                <div className="video-play-overlay" style={{
                                    position: 'absolute',
                                    inset: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 3,
                                    background: 'rgba(0,0,0,0.15)'
                                }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.25)',
                                        backdropFilter: 'blur(8px)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '1.5px solid #fff'
                                    }}>
                                        <Play size={18} fill="#fff" color="#fff" style={{ marginLeft: '2px' }} />
                                    </div>
                                </div>

                                {/* Contenido Flotante Abajo (Info & Métricas) */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '0',
                                    left: '0',
                                    right: '0',
                                    padding: '16px',
                                    zIndex: 3
                                }}>
                                    <p style={{
                                        fontSize: '0.78rem',
                                        fontWeight: '600',
                                        lineHeight: '1.4',
                                        marginBottom: '10px',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                                    }}>
                                        {reel.title}
                                    </p>

                                    {/* Grid de Métricas */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: 'rgba(255,255,255,0.85)', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '8px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                            <Heart size={12} fill="rgba(255,255,255,0.8)" /> {formatViews(reel.likes)}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                            <MessageSquare size={12} fill="rgba(255,255,255,0.8)" /> {formatViews(reel.comments)}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                            <Share2 size={12} /> {formatViews(reel.shares)}
                                        </span>
                                        <span style={{ color: 'var(--accent-cyan)', fontWeight: '700' }}>
                                            {formatViews(reel.views)} views
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            }
                </>
            )}

            {/* TAB: AD SPY */}
            {activeTab === 'ads' && (
                loadingAds ? (
                    <div className="niches-grid">
                        {[1, 2].map(i => (
                            <div key={i} className="stat-card skeleton" style={{ height: '280px', borderRadius: '16px' }} />
                        ))}
                    </div>
                ) : (
                    <div className="niches-grid">
                        {ads.map(ad => (
                            <div key={ad.id} className="niche-card" style={{ padding: 0, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', height: '280px', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
                                {/* Info Copy & Textos a la izquierda */}
                                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: '1px solid var(--border-subtle)' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            <span style={{
                                                fontSize: '0.62rem',
                                                background: 'rgba(0, 229, 160, 0.12)',
                                                border: '1px solid rgba(0, 229, 160, 0.3)',
                                                color: 'var(--accent-green)',
                                                padding: '2px 8px',
                                                borderRadius: '20px',
                                                fontWeight: '800'
                                            }}>
                                                ● ACTIVO
                                            </span>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                Circulando hace {ad.durationDays} días
                                            </span>
                                        </div>
                                        <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
                                            {ad.title}
                                        </h3>
                                        <p style={{
                                            fontSize: '0.78rem',
                                            lineHeight: '1.5',
                                            color: 'var(--text-secondary)',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 4,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            marginBottom: '12px'
                                        }}>
                                            {ad.copy}
                                        </p>
                                    </div>

                                    {/* Metadata Footer */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', fontSize: '0.7rem' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>
                                            Targeting: <strong style={{ color: 'var(--text-secondary)' }}>{ad.targeting.slice(0, 25)}...</strong>
                                        </span>
                                        <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.68rem', borderRadius: '6px' }}>
                                            {ad.cta}
                                        </button>
                                    </div>
                                </div>

                                {/* Creative de Anuncio a la derecha */}
                                <div style={{
                                    backgroundImage: `url(${ad.creativeUrl})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    position: 'relative'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '12px',
                                        background: 'rgba(24, 119, 242, 0.85)',
                                        color: '#fff',
                                        padding: '3px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.62rem',
                                        fontWeight: '700',
                                        backdropFilter: 'blur(6px)'
                                    }}>
                                        META ADS
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}

            {/* TAB: CEREBRO COPYWRITER */}
            {activeTab === 'copywriter' && (
                <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '24px', alignItems: 'start' }}>
                    {/* Panel de Inputs */}
                    <div className="niche-evaluator-card" style={{ padding: '20px', margin: 0 }}>
                        <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <Cpu size={16} /> Cerebro Copywriter
                        </h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                            Genera copys de alta conversión y guiones de Reels técnicos optimizados por IA.
                        </p>

                        <div className="evaluator-inputs">
                            <div className="filter-group">
                                <label className="filter-label">Idea de Nicho / Producto</label>
                                <input
                                    type="text"
                                    className="eval-input"
                                    placeholder="Ej: Accesorios fitness sustentables..."
                                    value={nicheInput}
                                    onChange={(e) => setNicheInput(e.target.value)}
                                />
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">Plataforma Objetivo</label>
                                <select
                                    className="eval-select"
                                    value={selectedPlatform}
                                    onChange={(e) => setSelectedPlatform(e.target.value)}
                                >
                                    <option value="Instagram">Instagram (Reels / Post)</option>
                                    <option value="Facebook">Facebook (Anuncio / Post)</option>
                                    <option value="Ambos">Ambas Plataformas (Meta Suite)</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">Formato del Contenido</label>
                                <select
                                    className="eval-select"
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                >
                                    <option value="Reel Script">Guion técnico de Reel (9:16)</option>
                                    <option value="Ad Copy">Texto Publicitario Persuasivo (AIDA)</option>
                                    <option value="Carousel Post">Guion de Carrusel (Diapositiva a Diapositiva)</option>
                                </select>
                            </div>

                            <button
                                className="btn-calculate"
                                onClick={generateCopy}
                                disabled={generatingCopy || !nicheInput.trim()}
                                style={{
                                    background: 'linear-gradient(45deg, #e1306c, #bc1888)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    width: '100%',
                                    marginTop: '8px'
                                }}
                            >
                                <Sparkles size={16} /> {generatingCopy ? 'Generando Copy...' : 'Generar con Cerebro IA'}
                            </button>
                        </div>
                    </div>

                    {/* Visor de Resultados */}
                    <div style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '16px',
                        padding: '24px',
                        minHeight: '400px',
                        position: 'relative'
                    }}>
                        {generatingCopy ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '350px', color: 'var(--text-muted)' }}>
                                <div className="live-dot" style={{ width: '12px', height: '12px', background: '#e1306c', marginBottom: '16px' }} />
                                <span style={{ fontSize: '0.85rem' }}>Escribiendo guion y copy optimizados...</span>
                            </div>
                        ) : aiContent ? (
                            <>
                                {/* Copiar Botón Flotante */}
                                <button
                                    onClick={handleCopy}
                                    className="btn-secondary"
                                    style={{
                                        position: 'absolute',
                                        top: '16px',
                                        right: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '0.72rem',
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        borderColor: copied ? 'var(--accent-green)' : 'var(--border-subtle)',
                                        color: copied ? 'var(--accent-green)' : 'var(--text-secondary)'
                                    }}
                                >
                                    {copied ? <Check size={12} /> : <Copy size={12} />}
                                    {copied ? 'Copiado' : 'Copiar todo'}
                                </button>

                                {/* Renderizador Inteligente */}
                                <div style={{ marginTop: '16px' }}>
                                    {renderedAiContent}
                                </div>
                            </>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '350px', color: 'var(--text-muted)', textAlign: 'center' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '12px', opacity: 0.4 }}>🧠</div>
                                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '4px' }}>Cerebro IA listo</h3>
                                <p style={{ fontSize: '0.78rem', maxWidth: '280px', lineHeight: '1.5' }}>
                                    Ingresa la idea del nicho a la izquierda y presiona Generar para ver la magia de la automatización.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL REELS PREVIEWER */}
            {selectedReel && (
                <div className="modal-overlay" onClick={() => setSelectedReel(null)}>
                    <div
                        className="reel-modal-container"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* LEFT: Video Mockup (Unsplash con animación de zoom sutil) */}
                        <div className="reel-modal-player" style={{ backgroundImage: `url(${selectedReel.thumbnail})` }}>
                            {/* Gradiente de fondo del Reel */}
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.0) 50%, rgba(0,0,0,0.85) 100%)',
                                zIndex: 1
                            }} />

                            {/* Botón de cerrar modal en el Reel (Solo visible en móviles si el panel derecho está oculto) */}
                            <button
                                onClick={() => setSelectedReel(null)}
                                className="modal-close-mobile-only"
                                style={{
                                    position: 'absolute',
                                    top: '16px',
                                    left: '16px',
                                    zIndex: 10,
                                    background: 'rgba(0,0,0,0.5)',
                                    color: '#fff',
                                    border: 'none',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '800'
                                }}
                            >
                                ✕
                            </button>

                            {/* Botones de Acción Flotantes a la derecha (Estilo Instagram) */}
                            <div style={{
                                position: 'absolute',
                                bottom: '100px',
                                right: '12px',
                                zIndex: 5,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px',
                                alignItems: 'center'
                            }}>
                                <div style={{ textAlign: 'center', color: '#fff', cursor: 'pointer' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
                                        <Heart size={18} fill="#fff" style={{ marginTop: '9px' }} />
                                    </div>
                                    <span style={{ fontSize: '0.62rem', fontWeight: '600' }}>{formatViews(selectedReel.likes)}</span>
                                </div>

                                <div style={{ textAlign: 'center', color: '#fff', cursor: 'pointer' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
                                        <MessageSquare size={18} fill="#fff" style={{ marginTop: '9px' }} />
                                    </div>
                                    <span style={{ fontSize: '0.62rem', fontWeight: '600' }}>{formatViews(selectedReel.comments)}</span>
                                </div>

                                <div style={{ textAlign: 'center', color: '#fff', cursor: 'pointer' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
                                        <Share2 size={18} color="#fff" style={{ marginTop: '9px' }} />
                                    </div>
                                    <span style={{ fontSize: '0.62rem', fontWeight: '600' }}>{formatViews(selectedReel.shares)}</span>
                                </div>
                            </div>

                            {/* Info del Reel al pie */}
                            <div style={{
                                position: 'absolute',
                                bottom: '24px',
                                left: '16px',
                                right: '60px',
                                zIndex: 5,
                                color: '#fff'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <img
                                        src={selectedReel.channelAvatar}
                                        alt={selectedReel.channel}
                                        style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1.5px solid #fff' }}
                                    />
                                    <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>@{selectedReel.channel}</span>
                                    <button style={{
                                        background: 'transparent',
                                        border: '1px solid #fff',
                                        borderRadius: '4px',
                                        color: '#fff',
                                        padding: '2px 8px',
                                        fontSize: '0.62rem',
                                        fontWeight: '700',
                                        cursor: 'pointer'
                                    }}>
                                        Seguir
                                    </button>
                                </div>
                                <p style={{ fontSize: '0.75rem', lineHeight: '1.4', margin: 0, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                                    {selectedReel.title}
                                </p>
                            </div>
                        </div>

                        {/* RIGHT: AI ANALYSIS PANEL */}
                        <div className="reel-modal-analysis">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Brain size={20} style={{ color: 'var(--accent-purple-light)' }} />
                                    <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'white', margin: 0 }}>Cerebro IA — Diagnóstico de Reel</h2>
                                </div>
                                <button
                                    onClick={() => setSelectedReel(null)}
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#fff',
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: '800'
                                    }}
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Outlier Ratio, VPH & Momentum Badges */}
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                                <div style={{ background: 'rgba(0, 229, 160, 0.08)', border: '1px solid rgba(0, 229, 160, 0.2)', borderRadius: '10px', padding: '6px 10px' }}>
                                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>OUTLIER RATIO</div>
                                    <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--accent-green)' }}>x{selectedReel.outlierRatio || (1.5 + (selectedReel.likes % 5) * 2).toFixed(1)}</div>
                                </div>
                                <div style={{ background: 'rgba(0, 212, 255, 0.08)', border: '1px solid rgba(0, 212, 255, 0.2)', borderRadius: '10px', padding: '6px 10px' }}>
                                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>VELOCIDAD (VPH)</div>
                                    <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--accent-cyan)' }}>{selectedReel.vph ? formatViews(selectedReel.vph) : 'N/A'}/h</div>
                                </div>
                                <div style={{ background: 'rgba(225, 48, 108, 0.08)', border: '1px solid rgba(225, 48, 108, 0.2)', borderRadius: '10px', padding: '6px 10px' }}>
                                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>MOMENTUM SCORE</div>
                                    <div style={{ fontSize: '1rem', fontWeight: '800', color: '#e1306c' }}>{selectedReel.momentumScore}%</div>
                                </div>
                            </div>

                            {/* Markdown render of AI Analysis */}
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
                                {renderReelAnalysisMarkdown(selectedReel.analysis || getDefaultReelAnalysis(selectedReel))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
