import { useState, useMemo } from 'react';
import { Target, Zap, TrendingUp, BarChart3, Info, AlertTriangle, CheckCircle2, DollarSign, Cpu, Loader2, Search, Brain, ShieldCheck, Sparkles, MessageSquare } from 'lucide-react';
import { searchVideos, checkHealth, fetchAIAdvisor } from '../services/api';
import { hasCredits, consumeCredit } from '../services/credits';

export default function NicheEvaluator() {
    const [topic, setTopic] = useState('');
    const [demand, setDemand] = useState('Media');
    const [competition, setCompetition] = useState('Media');
    const [cpmRange, setCpmRange] = useState('Medium ($5 - $15)');
    const [isCalculating, setIsCalculating] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [analysisLog, setAnalysisLog] = useState('');
    const [aiAdvice, setAiAdvice] = useState('');

    const effectiveness = useMemo(() => {
        let score = 0;
        const demandMap = { 'Baja': 30, 'Media': 65, 'Alta': 100 };
        score += demandMap[demand] * 0.4;
        const compMap = { 'Muy Baja': 100, 'Baja': 85, 'Media': 60, 'Alta': 30, 'Muy Alta': 10 };
        score += compMap[competition] * 0.3;
        const cpmMap = { 'Low ($1 - $5)': 20, 'Medium ($5 - $15)': 60, 'High ($15 - $50+)': 100 };
        score += cpmMap[cpmRange] * 0.3;
        return Math.round(score);
    }, [demand, competition, cpmRange]);

    const performSmartAnalysis = async () => {
        if (!topic.trim()) return;

        if (!hasCredits()) {
            setAnalysisLog('Error: Has agotado tus créditos de consulta. Por favor recarga créditos.');
            alert('Has agotado tus créditos de consulta. Por favor recarga créditos en el menú lateral para continuar.');
            return;
        }

        setIsCalculating(true);
        setIsAiLoading(true);
        setShowResult(false);
        setAiAdvice('');
        setAnalysisLog('Cerebro IA conectando a YouTube...');

        try {
            const health = await checkHealth();
            let currentVideos = [];
            let currentStats = { demand: 'Media', competition: 'Media', cpmRange: 'Medium ($5 - $15)' };

            if (!health.ok || health.keysConfigured === 0) {
                setAnalysisLog('Aviso: Usando motor local (API desconectada)');
                await new Promise(r => setTimeout(r, 1000));
            } else {
                setAnalysisLog(`Analizando señales para "${topic}"...`);
                const data = await searchVideos({ q: topic, max: 15 });
                currentVideos = data.videos || [];

                if (currentVideos.length > 0) {
                    // 1. Calcular Demanda
                    const totalVPH = currentVideos.reduce((acc, v) => acc + (v.vph || 0), 0);
                    let detectedDemand = 'Media';
                    if (totalVPH > 50000) detectedDemand = 'Alta';
                    else if (totalVPH > 10000) detectedDemand = 'Media';
                    else detectedDemand = 'Baja';
                    setDemand(detectedDemand);
                    currentStats.demand = detectedDemand;

                    // 2. Calcular Competencia
                    const bigChannels = currentVideos.filter(v => v.channelSubs > 500000).length;
                    const mediumChannels = currentVideos.filter(v => v.channelSubs > 100000 && v.channelSubs <= 500000).length;

                    let detectedComp = 'Media';
                    if (bigChannels > 8) detectedComp = 'Muy Alta';
                    else if (bigChannels > 5) detectedComp = 'Alta';
                    else if (mediumChannels > 5) detectedComp = 'Media';
                    else if (mediumChannels > 2) detectedComp = 'Baja';
                    else detectedComp = 'Muy Baja';
                    setCompetition(detectedComp);
                    currentStats.competition = detectedComp;

                    // 3. Inteligencia de CPM
                    const q = topic.toLowerCase();
                    const highCPM = ['finanzas', 'dinero', 'crypto', 'negocios', 'marketing', 'seguros', 'bienes raices', 'tech', 'software', 'trading', 'finance', 'money', 'business'];
                    const lowCPM = ['humor', 'vlog', 'noticias', 'gaming', 'juegos', 'funny', 'news', 'challenge'];

                    let detectedCpm = 'Medium ($5 - $15)';
                    if (highCPM.some(word => q.includes(word))) detectedCpm = 'High ($15 - $50+)';
                    else if (lowCPM.some(word => q.includes(word))) detectedCpm = 'Low ($1 - $5)';
                    setCpmRange(detectedCpm);
                    currentStats.cpmRange = detectedCpm;
                }
            }

            setAnalysisLog('Generando inteligencia estratégica (Gemini 2.0)...');
            try {
                const aiResponse = await fetchAIAdvisor({
                    niche: topic,
                    stats: currentStats,
                    videos: currentVideos
                });
                setAiAdvice(aiResponse.advice);
                consumeCredit(); // Consumir crédito tras respuesta IA
            } catch (aiErr) {
                console.error('Error en AI Advisor:', aiErr);
                setAiAdvice('No se pudo generar el consejo estratégico en este momento.');
            }

            setIsAiLoading(false);
            setAnalysisLog('Análisis completado con éxito.');
            setTimeout(() => {
                setIsCalculating(false);
                setShowResult(true);
            }, 500);

        } catch (error) {
            console.error('Error en análisis:', error);
            setAnalysisLog('Error en conexión.');
            setIsCalculating(false);
            setIsAiLoading(false);
            setShowResult(true);
        }
    };

    const getVerdict = (score) => {
        if (score > 85) return { label: 'Oportunidad de Oro', color: 'var(--accent-green)', icon: <CheckCircle2 size={16} />, desc: 'Este nicho tiene un potencial masivo. La baja competencia y alta rentabilidad sugieren una entrada rápida.' };
        if (score > 65) return { label: 'Muy Rentable', color: 'var(--accent-cyan)', icon: <TrendingUp size={16} />, desc: 'Nicho sólido con buen equilibrio. Recomendado para creadores que buscan crecimiento constante.' };
        if (score > 45) return { label: 'Viable con Estrategia', color: 'var(--accent-yellow)', icon: <Zap size={16} />, desc: 'Nicho competitivo o de rentabilidad media. Requiere un ángulo único o alta calidad para destacar.' };
        return { label: 'Alto Riesgo / Baja Recompensa', color: 'var(--accent-red)', icon: <AlertTriangle size={16} />, desc: 'Mercado saturado o CPM insuficiente. Considera pivotar a un sub-nicho más específico.' };
    };

    const verdict = getVerdict(effectiveness);

    return (
        <section className="niche-evaluator-card">
            <div className="evaluator-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="evaluator-icon"><Brain size={20} color="var(--accent-purple-light)" /></div>
                    <div>
                        <h3 className="evaluator-title">Evaluador de Efectividad (Cerebro IA)</h3>
                        <p className="evaluator-subtitle">Análisis profundo basado en datos de mercado reales</p>
                    </div>
                </div>
                {isCalculating && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Loader2 size={14} className="spin" />
                        {analysisLog}
                    </div>
                )}
            </div>

            <div className="evaluator-body">
                <div className="evaluator-inputs">
                    <div className="input-group">
                        <label>Idea de Nicho / Canal / Palabra Clave</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Ej: Finanzas Personales para Jóvenes..."
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="eval-input"
                                style={{ paddingLeft: 40 }}
                            />
                            <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                <Search size={16} />
                            </div>
                        </div>
                    </div>

                    <div className="eval-grid">
                        <div className="input-group">
                            <label>Demanda Detectada</label>
                            <select value={demand} onChange={(e) => setDemand(e.target.value)} className="eval-select">
                                <option>Baja</option>
                                <option>Media</option>
                                <option>Alta</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Nivel de Competencia</label>
                            <select value={competition} onChange={(e) => setCompetition(e.target.value)} className="eval-select">
                                <option>Muy Baja</option>
                                <option>Baja</option>
                                <option>Media</option>
                                <option>Alta</option>
                                <option>Muy Alta</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>CPM Industry Tier</label>
                            <select value={cpmRange} onChange={(e) => setCpmRange(e.target.value)} className="eval-select">
                                <option>Low ($1 - $5)</option>
                                <option>Medium ($5 - $15)</option>
                                <option>High ($15 - $50+)</option>
                            </select>
                        </div>
                    </div>

                    <button
                        className={`btn-calculate ${isCalculating ? 'loading' : ''}`}
                        onClick={performSmartAnalysis}
                        disabled={!topic || isCalculating}
                        style={{ height: 52 }}
                    >
                        <Sparkles size={18} style={{ marginRight: 8 }} />
                        {isCalculating ? 'Analizando en Tiempo Real...' : 'Analizar con Inteligencia Artificial'}
                    </button>
                    {!showResult && !isCalculating && (
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
                            * El sistema usará la API de YouTube y Gemini 2.0 para un análisis 360°.
                        </p>
                    )}
                </div>

                {showResult && (
                    <div className="evaluator-result" style={{ animation: 'fade-in 0.5s ease-out' }}>
                        <div className="result-main">
                            <div className="effectiveness-ring" style={{ '--percent': effectiveness, '--color': verdict.color }}>
                                <svg width="120" height="120" viewBox="0 0 120 120">
                                    <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                    <circle cx="60" cy="60" r="54" fill="none" stroke={verdict.color} strokeWidth="8"
                                        strokeDasharray="339.29" strokeDashoffset={339.29 - (339.29 * effectiveness) / 100}
                                        strokeLinecap="round" transform="rotate(-90 60 60)"
                                    />
                                </svg>
                                <div className="percent-val" style={{ color: verdict.color }}>{effectiveness}<span>%</span></div>
                            </div>
                            <div className="verdict-info">
                                <div className="verdict-badge" style={{ background: `${verdict.color}20`, color: verdict.color }}>
                                    {verdict.icon}
                                    {verdict.label}
                                </div>
                                <p className="verdict-desc">{verdict.desc}</p>
                            </div>
                        </div>

                        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 4 }}>Estado de Demanda</div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{demand === 'Alta' ? '📈 Volumen Crítico' : demand === 'Media' ? '📊 Creciente' : '❄️ Nicho de baja rotación'}</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 4 }}>Señal de Saturación</div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{['Muy Baja', 'Baja'].includes(competition) ? '✅ Océano Azul' : '⚠️ Mercado Maduro'}</div>
                            </div>
                        </div>

                        {/* AI Advisor Block */}
                        {aiAdvice && (
                            <div className="ai-advisor-block" style={{ marginTop: 24, padding: 20, borderRadius: 12, background: 'rgba(123, 47, 255, 0.05)', border: '1px solid rgba(123, 47, 255, 0.2)', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.1 }}>
                                    <Cpu size={100} color="var(--accent-purple-light)" />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 15 }}>
                                    <Sparkles size={18} color="var(--accent-purple-light)" />
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Consejo Estratégico (Cerebro IA)</h4>
                                </div>
                                <div className="ai-content" style={{ fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                                    {aiAdvice}
                                </div>
                            </div>
                        )}

                        <div className="result-footer" style={{ marginTop: 24, borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
                            <div className="footer-item" style={{ fontSize: '0.7rem' }}>
                                <ShieldCheck size={14} color="var(--accent-green)" />
                                <span><b>Inteligencia Verificada:</b> Datos combinados de YouTube API + Gemini 2.0 Flash.</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
