import { useEffect, useState } from 'react';
import { X, Youtube, Brain, Loader2 } from 'lucide-react';
import { analyzeVideo } from '../services/api';

export default function VideoModal({ video, onClose }) {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    useEffect(() => {
        if (!video?.id) return;
        let cancelled = false;
        
        async function fetchAnalysis() {
            setLoading(true);
            setError(null);
            setAnalysis(null);
            try {
                const data = await analyzeVideo(video.id);
                if (!cancelled) {
                    setAnalysis(data.analysis);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || 'Error al conectar con el Cerebro IA.');
                }
            }
            if (!cancelled) setLoading(false);
        }

        fetchAnalysis();
        return () => { cancelled = true; };
    }, [video?.id]);

    if (!video) return null;

    return (
        <div className="modal-overlay" onClick={onClose} aria-modal="true" role="dialog" style={{ cursor: 'pointer' }}>
            <button
                className="modal-close-fixed"
                onClick={onClose}
                aria-label="Cerrar reproductor"
            >
                <X size={32} color="#fff" />
            </button>

            <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ cursor: 'default' }}>
                <div className="video-player-wrapper">
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>

                <div className="modal-details">
                    <div className="modal-header-row">
                        <h2 className="modal-title">{video.title}</h2>
                        <div className="modal-actions">
                            <a
                                href={`https://www.youtube.com/watch?v=${video.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-secondary"
                            >
                                <Youtube size={16} /> Abrir en YouTube
                            </a>
                        </div>
                    </div>

                    <div className="modal-channel-info">
                        <img src={video.channelAvatar} alt={video.channel} className="channel-avatar" />
                        <div>
                            <div className="channel-name">{video.channel}</div>
                            <div className="channel-subs">{video.channelSubs?.toLocaleString()} suscriptores</div>
                        </div>
                    </div>

                    <div className="modal-metrics">
                        <div className="modal-metric">
                            <span className="label">Vistas Totales</span>
                            <span className="value">{video.views?.toLocaleString()}</span>
                        </div>
                        <div className="modal-metric">
                            <span className="label">Engagem. Rate</span>
                            <span className="value" style={{ color: 'var(--accent-cyan)' }}>{video.engagementRate}%</span>
                        </div>
                        <div className="modal-metric">
                            <span className="label">Momentum Score</span>
                            <span className="value" style={{ color: 'var(--accent-purple-light)' }}>{video.momentumScore}/100</span>
                        </div>
                    </div>

                    {/* AI Analysis Section */}
                    <div className="modal-ai-analysis" style={{ marginTop: 20, borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <Brain size={18} color="var(--accent-purple-light)" />
                            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Análisis del Cerebro IA
                            </h3>
                        </div>

                        {loading ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                <Loader2 size={14} className="spin" />
                                <span>Cerebro IA decodificando el video...</span>
                            </div>
                        ) : error ? (
                            <div style={{ fontSize: '0.8rem', color: 'var(--accent-red)', padding: '8px 0' }}>
                                ⚠️ No se pudo cargar el análisis: {error}
                            </div>
                        ) : analysis ? (
                            <div className="ai-analysis-content" style={{
                                fontSize: '0.82rem',
                                lineHeight: '1.6',
                                color: 'var(--text-secondary)',
                                whiteSpace: 'pre-line',
                                background: 'rgba(123, 47, 255, 0.04)',
                                border: '1px solid rgba(123, 47, 255, 0.15)',
                                padding: '12px 16px',
                                borderRadius: 10,
                                maxHeight: '200px',
                                overflowY: 'auto'
                            }}>
                                {analysis}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
