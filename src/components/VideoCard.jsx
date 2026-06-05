import { formatViews, formatSubs, formatVPH, timeAgo } from '../services/api';
import { Youtube } from 'lucide-react';

function getMomentumColor(score) {
    if (score >= 85) return '#FF3B5C';
    if (score >= 65) return '#FFB800';
    if (score >= 45) return '#00E5A0';
    return '#8888aa';
}

function getMomentumClass(score) {
    if (score >= 85) return 'score-high';
    if (score >= 65) return 'score-med-high';
    if (score >= 45) return 'score-med';
    return 'score-low';
}

const TREND_LABELS = {
    fire: { label: '🔥 EN LLAMAS', cls: 'fire' },
    hot: { label: '⚡ CALIENTE', cls: 'hot' },
    rising: { label: '📈 EN ASCENSO', cls: 'rising' },
    normal: { label: '· Normal', cls: 'normal' },
};

export default function VideoCard({ video, onPlay }) {
    const trend = TREND_LABELS[video.trending] || TREND_LABELS.normal;
    const scoreColor = getMomentumColor(video.momentumScore);
    const scoreClass = getMomentumClass(video.momentumScore);
    const pubDate = video.publishedAt instanceof Date ? video.publishedAt : new Date(video.publishedAt);

    return (
        <article className="video-card" id={`video-${video.id}`} onClick={onPlay} style={{ cursor: 'pointer' }}>
            <div className="video-thumb-wrapper">
                <img
                    className="video-thumb"
                    src={video.thumbnail}
                    alt={video.title}
                    loading="lazy"
                    onError={(e) => { e.target.src = `https://picsum.photos/seed/${video.id}/640/360`; }}
                />
                <div className="video-play-overlay">
                    <div className="play-icon-circle">
                        <Youtube size={24} fill="currentColor" />
                    </div>
                </div>
                <span className="video-duration">{video.duration}</span>
                <div className={`momentum-badge ${trend.cls}`}>{trend.label}</div>
            </div>

            <div className="video-card-body">
                {/* Channel Row */}
                <div className="video-channel">
                    <img
                        className="channel-avatar"
                        src={video.channelAvatar}
                        alt={video.channel}
                        onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${video.channel}&backgroundColor=7B2FFF&textColor=fff`; }}
                    />
                    <span className="channel-name">{video.channel}</span>
                    <span className="channel-subs">
                        {video.channelSubs > 0 ? `${formatSubs(video.channelSubs)} subs · ` : ''}
                        {timeAgo(pubDate)}
                    </span>
                </div>

                {/* Title */}
                <h3 className="video-title">{video.title}</h3>

                {/* Metrics Row */}
                <div className="video-metrics">
                    <div className="metric">
                        <span className="metric-label">Vistas</span>
                        <span className="metric-value">{formatViews(video.views)}</span>
                    </div>
                    <div className="metric">
                        <span className="metric-label">VPH</span>
                        <span className="metric-value vph">{formatVPH(video.vph)}</span>
                    </div>
                    <div className="metric">
                        <span className="metric-label">Outlier ×</span>
                        <span className="metric-value outlier">×{(video.outlierRatio || 0).toFixed(1)}</span>
                    </div>
                    <div className="metric">
                        <span className="metric-label">Engage.</span>
                        <span className="metric-value engagement">{(video.engagementRate || 0).toFixed(1)}%</span>
                    </div>
                </div>

                {/* Momentum Score Bar */}
                <div className="momentum-score-bar">
                    <div className="ms-label-row">
                        <span className="ms-label">Momentum Score</span>
                        <span className={`ms-score ${scoreClass}`}>{video.momentumScore}/100</span>
                    </div>
                    <div className="ms-bar-track">
                        <div
                            className="ms-bar-fill"
                            style={{
                                width: `${video.momentumScore}%`,
                                background: `linear-gradient(90deg, ${scoreColor}99, ${scoreColor})`,
                            }}
                        />
                    </div>
                </div>

                {/* Source badge */}
                {video._source && (
                    <div style={{ marginTop: 8, fontSize: '0.6rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {video._source === 'youtube_api_v3' ? '🟢' : '🔵'} {video._source === 'youtube_api_v3' ? 'YouTube API v3 en vivo' : 'Datos demo'}
                    </div>
                )}
            </div>
        </article>
    );
}
