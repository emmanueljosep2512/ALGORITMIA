import { useNavigate } from 'react-router-dom';
import { Zap, TrendingUp, BarChart3, ShieldCheck, ChevronRight, PlayCircle, Globe, Target, Cpu, Brain, Flame } from 'lucide-react';

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div className="landing-page">
            <header className="landing-nav">
                <div className="logo-text-premium" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    ALGORITM<span>.IA</span>
                </div>
                <div className="nav-links">
                    <button className="btn-text">Testimonios</button>
                    <button className="btn-text">Precios</button>
                    <button className="btn-primary-glow" onClick={() => navigate('/login')}>
                        Entrar a la APP
                    </button>
                </div>
            </header>

            <main className="landing-main">
                <section className="hero-section" style={{ position: 'relative' }}>
                    {/* Floating Viral Hooks */}
                    <div className="floating-data-container">
                        <div className="floating-hook h1">
                            <span className="hook-tag">OUTLIER</span>
                            <span className="hook-val">x142</span>
                            <TrendingUp size={14} color="var(--accent-cyan)" />
                        </div>
                        <div className="floating-hook h2">
                            <span className="hook-tag">HOT</span>
                            <span className="hook-val">89%</span>
                            <Flame size={14} color="var(--accent-purple-light)" />
                        </div>
                        <div className="floating-hook h3">
                            <span className="hook-tag">CPM</span>
                            <span className="hook-val">$42.8</span>
                            <Zap size={14} color="var(--accent-green)" />
                        </div>
                        <div className="floating-hook h4">
                            <span className="hook-tag">LIVE</span>
                            <span className="hook-val">400K+</span>
                            <Globe size={14} color="var(--accent-cyan)" />
                        </div>
                    </div>

                    <div className="hero-badge" style={{ position: 'relative', zIndex: 2 }}>
                        <Zap size={14} />
                        <span>LA INTELIGENCIA ARTIFICIAL QUE DOMINA YOUTUBE</span>
                    </div>
                    <h1 className="hero-title" style={{ position: 'relative', zIndex: 2 }}>
                        Escala tu Canal de YouTube <br />
                        <span>Basado en DATOS</span>, No en Suerte.
                    </h1>
                    <p className="hero-subtitle" style={{ position: 'relative', zIndex: 2 }}>
                        Encuentra nichos sin competencia, predice tendencias antes que nadie <br />
                        y calcula tu rentabilidad real con precisión quirúrgica.
                    </p>

                    <div className="hero-actions" style={{ position: 'relative', zIndex: 2 }}>
                        <button className="btn-hero-main" onClick={() => navigate('/login')}>
                            Empezar Ahora <ChevronRight size={18} />
                        </button>
                        <button className="btn-hero-secondary">
                            <PlayCircle size={18} /> Ver Masterclass Gratis
                        </button>
                    </div>

                    <div className="hero-stats-bar" style={{ position: 'relative', zIndex: 2 }}>
                        <div className="hero-stat">
                            <div className="stat-num">+400K</div>
                            <div className="stat-desc">Canales Analizados</div>
                        </div>
                        <div className="hero-stat">
                            <div className="stat-num">98%</div>
                            <div className="stat-desc">Precisión de Predictor</div>
                        </div>
                        <div className="hero-stat">
                            <div className="stat-num">TOP 1%</div>
                            <div className="stat-desc">Creadores Élite</div>
                        </div>
                    </div>
                </section>

                <section className="outlier-power-section">
                    <div className="section-title" style={{ justifyContent: 'center', marginBottom: 20 }}>
                        <div className="section-dot purple" />
                        <h2 style={{ fontSize: '2rem' }}>El Secreto de la Viralidad: Outlier Ratio</h2>
                    </div>
                    <p style={{ maxWidth: 700, margin: '0 auto', color: 'var(--text-secondary)' }}>
                        Mientras otros cazan vistas, los expertos cazan <b>Outliers</b>. Detectamos videos que rinden hasta 100 veces mejor que el promedio del canal, indicando un nicho virgen y explosivo.
                    </p>

                    <div className="outlier-comparison">
                        <div className="comp-box">
                            <div className="comp-label">Canal Promedio</div>
                            <div className="comp-graph">
                                <div className="graph-bar" style={{ height: '30%' }} />
                                <div className="graph-bar" style={{ height: '40%' }} />
                                <div className="graph-bar" style={{ height: '35%' }} />
                            </div>
                            <div className="comp-metric">1x</div>
                            <div className="comp-desc">Crecimiento lento y lineal.</div>
                        </div>

                        <div className="comp-box viral">
                            <div className="comp-label">Estrategia AlgoritmIA</div>
                            <div className="comp-graph">
                                <div className="graph-bar" style={{ height: '20%' }} />
                                <div className="graph-bar accent" style={{ height: '100%', animation: 'pulse-glow 2s infinite' }} />
                                <div className="graph-bar" style={{ height: '25%' }} />
                            </div>
                            <div className="comp-metric" style={{ color: 'var(--accent-cyan)' }}>80x+</div>
                            <div className="comp-desc">Detección de outliers virales instantáneos.</div>
                        </div>
                    </div>
                </section>

                <section className="features-grid-landing">
                    <div className="feature-item-glass">
                        <div className="feature-icon-wrapper cyan">
                            <Target size={24} />
                        </div>
                        <h3>Buscador de Nichos</h3>
                        <p>Filtra por idioma, competencia y crecimiento para encontrar minas de oro digitales.</p>
                    </div>
                    <div className="feature-item-glass">
                        <div className="feature-icon-wrapper purple">
                            <TrendingUp size={24} />
                        </div>
                        <h3>Análisis de Tendencias</h3>
                        <p>Conexión directa con la red neuronal para detectar temas virales antes de que estallen.</p>
                    </div>
                    <div className="feature-item-glass">
                        <div className="feature-icon-wrapper green">
                            <Globe size={24} />
                        </div>
                        <h3>Calculadora de CPM Real</h3>
                        <p>Datos oficiales de monetización por país (EE.UU, España, LATAM) y vistas necesarias.</p>
                    </div>
                </section>
            </main>

            <footer className="landing-footer">
                <p>&copy; 2025 AlgoritmIA — El Cerebro de los Creadores de Contenido.</p>
            </footer>

         </div >
    );
}
