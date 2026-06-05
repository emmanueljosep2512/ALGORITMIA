import { useEffect } from 'react';
import { X, Youtube } from 'lucide-react';

export default function VideoModal({ video, onClose }) {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

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
                </div>
            </div>
        </div>
    );
}
