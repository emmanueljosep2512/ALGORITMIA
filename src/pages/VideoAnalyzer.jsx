import { useState } from 'react';
import { Play, Search, Brain, Cpu, Loader2, Sparkles, Youtube, Flame, TrendingUp, Eye, Zap, ShieldCheck } from 'lucide-react';
import { analyzeVideo, formatViews, formatVPH } from '../services/api';

function extractVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export default function VideoAnalyzer() {
    const [urlInput, setUrlInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    const handleAnalyze = async (e) => {
        if (e) e.preventDefault();
        const videoId = extractVideoId(urlInput);
        if (!videoId) {
            setError('Por favor, ingresa un enlace válido de YouTube (ej. https://www.youtube.com/watch?v=...)');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await analyzeVideo(videoId);
            setResult(data);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Error al conectar con el servidor. Verifica que tu backend esté encendido.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-content">
            {/* Page Header */}
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <h1>✨ Analizador de Video</h1>
                    <div className="trending-pill" style={{ borderColor: 'rgba(123,47,255,0.4)', color: 'var(--accent-purple-light)', background: 'rgba(123,47,255,0.08)' }}>
                        <div className="live-dot" style={{ background: 'var(--accent-purple-light)' }} />
                        DIAGNÓSTICO 360°
                    </div>
                </div>
                <p>Pega cualquier enlace de YouTube para calcular su Momentum Score, Outlier Ratio y obtener un desglose táctico con Inteligencia Artificial.</p>
            </div>

            {/* Input Card */}
            <div className="stat-card" style={{ padding: 24, marginBottom: 32, border: '1px solid rgba(255,255,255,0.05)' }}>
                <form onSubmit={handleAnalyze} style={{ display: 'flex', gap: 12 }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <input
                            type="text"
                            placeholder="Pega el link de YouTube aquí... (ej. https://www.youtube.com/watch?v=dQw4w9WgXcQ)"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            className="eval-input"
                            style={{ paddingLeft: 44, width: '100%', height: 50 }}
                            disabled={loading}
                        />
                        <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                            <Youtube size={18} />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className={`btn-calculate ${loading ? 'loading' : ''}`}
                        disabled={!urlInput.trim() || loading}
                        style={{ height: 50, padding: '0 24px', flexShrink: 0 }}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="spin" style={{ marginRight: 8 }} />
                                Analizando...
                            </>
                        ) : (
                            <>
                                <Sparkles size={16} style={{ marginRight: 8 }} />
                                Diagnosticar
                            </>
                        )}
                    </button>
                </form>
                {error && (
                    <div style={{ marginTop: 12, color: 'var(--accent-red)', fontSize: '0.8rem' }}>
                        ⚠️ {error}
                    </div>
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '48px 0' }}>
                    <Loader2 size={40} className="spin" style={{ color: 'var(--accent-purple-light)' }} />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        El Cerebro IA está escaneando las métricas de YouTube y procesando la estructura del video...
                    </p>
                </div>
            )}

            {/* Results Section */}
            {result && !loading && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: 28, animation: 'fade-in 0.6s ease-out' }}>
                    {/* Left Column: Video & Metrics */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {/* Video Player */}
                        <div style={{
                            background: 'var(--bg-card)',
                            borderRadius: 16,
                            overflow: 'hidden',
                            border: '1px solid var(--border-subtle)',
                            boxShadow: 'var(--shadow-lg)'
                        }}>
                            <div style={{ width: '100%', aspectRatio: '16/9', background: '#000' }}>
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${result.video.id}`}
                                    title={result.video.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                            <div style={{ padding: 16 }}>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 8px 0', lineHeight: 1.4 }}>
                                    {result.video.title}
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <img src={result.video.channelAvatar} alt={result.video.channel} style={{ width: 28, height: 28, borderRadius: '50%' }} />
                                    <div>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{result.video.channel}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                            {result.video.channelSubs?.toLocaleString()} suscriptores
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Metrics Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div className="stat-card" style={{ padding: 16 }}>
                                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Multiplicador Outlier</div>
                                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-cyan)', margin: '4px 0' }}>
                                    ×{result.video.outlierRatio}
                                </div>
                                <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>
                                    Rendimiento vs canal
                                </div>
                            </div>

                            <div className="stat-card" style={{ padding: 16 }}>
                                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Momentum Score</div>
                                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-purple-light)', margin: '4px 0' }}>
                                    {result.video.momentumScore}/100
                                </div>
                                <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                                    {result.video.trending} 🔥
                                </div>
                            </div>

                            <div className="stat-card" style={{ padding: 16 }}>
                                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Velocidad Actual</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, margin: '6px 0' }}>
                                    {formatVPH(result.video.vph)}
                                </div>
                                <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>
                                    Vistas por hora
                                </div>
                            </div>

                            <div className="stat-card" style={{ padding: 16 }}>
                                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Engagement Rate</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, margin: '6px 0', color: 'var(--accent-green)' }}>
                                    {result.video.engagementRate}%
                                </div>
                                <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>
                                    Likes + Comentarios
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: AI Analysis */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(123,47,255,0.05), rgba(0,212,255,0.02))',
                        border: '1px solid rgba(123,47,255,0.2)',
                        borderRadius: 16,
                        padding: 28,
                        boxShadow: 'var(--shadow-lg)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 20
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(123,47,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Brain size={18} style={{ color: 'var(--accent-purple-light)' }} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1rem', margin: 0 }}>Análisis Táctico de IA</h3>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>Cerebro AlgoritmIA v2.0</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,229,160,0.1)', padding: '4px 10px', borderRadius: 50, border: '1px solid rgba(0,229,160,0.3)' }}>
                                <ShieldCheck size={12} style={{ color: 'var(--accent-green)' }} />
                                <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--accent-green)' }}>PATRONES VERIFICADOS</span>
                            </div>
                        </div>

                        <div className="markdown-analysis-view" style={{
                            fontSize: '0.85rem',
                            lineHeight: '1.7',
                            color: 'var(--text-secondary)',
                            whiteSpace: 'pre-line',
                            overflowY: 'auto',
                            maxHeight: '480px',
                            paddingRight: 10
                        }}>
                            {result.analysis}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
