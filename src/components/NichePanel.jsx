import { formatViews, formatVPH } from '../data/mockVideos';

function getOppColor(level) {
    if (level === 'high') return 'var(--accent-green)';
    if (level === 'medium') return 'var(--accent-yellow)';
    return 'var(--text-secondary)';
}

export default function NichePanel({ niche, onSelect }) {
    return (
        <article className="niche-card" id={`niche-${niche.id}`} onClick={onSelect} style={{ cursor: 'pointer' }}>
            <div className="niche-header">
                <div className="niche-emoji" role="img" aria-label={niche.name}>{niche.emoji}</div>
                <div className="niche-info">
                    <h3 className="niche-name">{niche.name}</h3>
                    <p className="niche-desc">{niche.desc}</p>
                </div>
                <div className="opportunity-score">
                    <span className="opp-label">Oportunidad</span>
                    <span className={`opp-value ${niche.opportunityLevel}`}>{niche.opportunityScore}</span>
                </div>
            </div>

            <div className="niche-metrics">
                <div className="niche-metric">
                    <div className="niche-metric-val">{formatViews(niche.avgViews)}</div>
                    <div className="niche-metric-lbl">Vistas Medias</div>
                </div>
                <div className="niche-metric">
                    <div className="niche-metric-val" style={{ color: 'var(--accent-cyan)' }}>
                        {formatVPH(niche.avgVPH)}
                    </div>
                    <div className="niche-metric-lbl">VPH Medio</div>
                </div>
                <div className="niche-metric">
                    <div className="niche-metric-val" style={{ color: 'var(--accent-purple-light)' }}>
                        {niche.totalChannels}
                    </div>
                    <div className="niche-metric-lbl">Canales Activos</div>
                </div>
                <div className="niche-metric">
                    <div className="niche-metric-val" style={{ color: 'var(--accent-green)' }}>
                        {niche.growthRate}
                    </div>
                    <div className="niche-metric-lbl">Crecimiento</div>
                </div>
                <div className="niche-metric">
                    <div className="niche-metric-val">×{niche.topOutlierRatio}</div>
                    <div className="niche-metric-lbl">Top Outlier</div>
                </div>
                <div className="niche-metric">
                    <div className="niche-metric-lbl">Competencia</div>
                </div>
                <div className="niche-metric">
                    <div className="niche-metric-val" style={{ color: 'var(--accent-green)' }}>
                        ${niche.cpmData[niche.region] || niche.cpmData.default}
                    </div>
                    <div className="niche-metric-lbl">CPM ({niche.region || 'US'})</div>
                </div>
            </div>

            <div className="niche-tags">
                {niche.languages.map(l => (
                    <span key={l} className="niche-tag" style={{ borderColor: 'rgba(123,47,255,0.3)', color: 'var(--accent-purple-light)', background: 'rgba(123,47,255,0.08)' }}>
                        🌐 {l.toUpperCase()}
                    </span>
                ))}
                {niche.tags.map(t => (
                    <span
                        key={t}
                        className="niche-tag active"
                        onClick={() => { console.log('Sub-nicho:', t); }}
                        style={{ cursor: 'pointer' }}
                    >
                        {t}
                    </span>
                ))}
            </div>
        </article>
    );
}
