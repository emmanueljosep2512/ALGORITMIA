import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Check, ShieldCheck, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SubscriptionBarrier = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [simulating, setSimulating] = useState(false);

    const handleSubscribeMock = (planName, credits) => {
        setSimulating(true);
        setTimeout(() => {
            localStorage.setItem('algoritmia_subscribed', 'true');
            localStorage.setItem('algoritmia_plan', planName);
            localStorage.setItem('algoritmia_credits', credits.toString());
            localStorage.setItem('algoritmia_credits_total', credits.toString());
            
            // Notificar a otros componentes (como el Sidebar) que cambió el storage
            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new Event('creditsUpdated'));
            
            setSimulating(false);
            navigate('/dashboard');
        }, 800);
    };

    return (
        <div className="paywall-container">
            <div className="paywall-header">
                <div className="brand-logo">🧠 ALGORITM<span>.IA</span></div>
                <h1>Acceso Premium Requerido</h1>
                <p className="subtitle">
                    AlgoritmIA utiliza procesamiento avanzado de redes neuronales y APIs de alta densidad. Selecciona tu plan para desbloquear la plataforma.
                </p>
            </div>

            <div className="pricing-grid">
                {/* PLAN CREADOR PRO */}
                <div className="pricing-card">
                    <div className="card-popular-badge">RECOMENDADO</div>
                    <div className="card-header">
                        <h3>Creador PRO</h3>
                        <p className="card-desc">Ideal para creadores y editores optimizando un canal principal.</p>
                        <div className="price-box">
                            <span className="currency">$</span>
                            <span className="price-val">19</span>
                            <span className="period">/ mes</span>
                        </div>
                    </div>
                    <div className="card-body">
                        <ul className="features-list">
                            <li><Check size={16} className="feat-check" /> <strong>150 créditos</strong> de análisis al mes</li>
                            <li><Check size={16} className="feat-check" /> Buscador de Nichos Avanzado</li>
                            <li><Check size={16} className="feat-check" /> VPH y Outlier Ratios en vivo</li>
                            <li><Check size={16} className="feat-check" /> Asesor de Guiones IA (CO-STAR)</li>
                        </ul>
                    </div>
                    <div className="card-footer">
                        <a 
                            href="https://buy.stripe.com/test_4gw291e0H96j9vScMM" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="pay-btn standard"
                        >
                            Suscribirse Creador PRO
                        </a>
                    </div>
                </div>

                {/* PLAN AGENCIA ELITE */}
                <div className="pricing-card premium-glow">
                    <div className="card-premium-badge"><Sparkles size={12} fill="currentColor" /> ÉLITE</div>
                    <div className="card-header">
                        <h3>Agencia Élite</h3>
                        <p className="card-desc">Para agencias, productoras o creadores con múltiples canales.</p>
                        <div className="price-box">
                            <span className="currency">$</span>
                            <span className="price-val">39</span>
                            <span className="period">/ mes</span>
                        </div>
                    </div>
                    <div className="card-body">
                        <ul className="features-list">
                            <li><Check size={16} className="feat-check cyan" /> <strong>400 créditos</strong> de análisis (¡Ahorra más!)</li>
                            <li><Check size={16} className="feat-check cyan" /> Prioridad de cómputo en Servidores IA</li>
                            <li><Check size={16} className="feat-check cyan" /> Todos los beneficios de Creador PRO</li>
                            <li><Check size={16} className="feat-check cyan" /> Soporte prioritario 24/7</li>
                        </ul>
                    </div>
                    <div className="card-footer">
                        <a 
                            href="https://buy.stripe.com/test_eVaeVf4ql3LZ6jGeUV" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="pay-btn premium"
                        >
                            Suscribirse Agencia Élite
                        </a>
                    </div>
                </div>
            </div>

            {/* MÓDULO DE SIMULACIÓN PARA BETA TESTING */}
            <div className="beta-sim-panel">
                <div className="sim-title">
                    <ShieldCheck size={16} style={{ color: 'var(--accent-cyan)' }} />
                    Panel de Simulación de Pago (Beta Developer Mode)
                </div>
                <p>Usa estos botones para saltarte la pasarela de Stripe temporalmente y cargar créditos a tu cuenta de prueba:</p>
                <div className="sim-actions">
                    <button 
                        onClick={() => handleSubscribeMock('Creador PRO', 150)} 
                        disabled={simulating}
                        className="sim-btn pro"
                    >
                        {simulating ? 'Procesando...' : 'Simular Pago: Creador PRO (150 Cr)'}
                    </button>
                    <button 
                        onClick={() => handleSubscribeMock('Agencia Élite', 400)} 
                        disabled={simulating}
                        className="sim-btn elite"
                    >
                        {simulating ? 'Procesando...' : 'Simular Pago: Agencia Élite (400 Cr)'}
                    </button>
                </div>
            </div>

            <div className="paywall-footer">
                <button className="back-btn" onClick={() => logout()}>
                    <ArrowLeft size={14} /> Cerrar Sesión
                </button>
                <p className="secure-text">🔒 Pagos procesados de forma segura mediante encriptación SSL de Stripe.</p>
            </div>

            <style>{`
                .paywall-container {
                    min-height: 100vh;
                    background: radial-gradient(circle at top right, #110c22, #07070f);
                    color: white;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 3rem 2rem;
                    font-family: 'Inter', sans-serif;
                }

                .paywall-header {
                    text-align: center;
                    margin-bottom: 3rem;
                    max-width: 650px;
                }

                .brand-logo {
                    font-family: 'Outfit', sans-serif;
                    font-size: 1.5rem;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                    color: #FFFFFF;
                    margin-bottom: 1rem;
                }

                .brand-logo span {
                    color: var(--accent-cyan);
                }

                .paywall-header h1 {
                    font-size: 2.8rem;
                    font-family: 'Outfit', sans-serif;
                    font-weight: 800;
                    background: linear-gradient(to right, #ffffff, #a39bbd);
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 1rem;
                }

                .paywall-header .subtitle {
                    color: var(--text-secondary);
                    font-size: 1.05rem;
                    line-height: 1.6;
                }

                .pricing-grid {
                    display: flex;
                    gap: 2rem;
                    max-width: 900px;
                    width: 100%;
                    margin-bottom: 3rem;
                    align-items: stretch;
                }

                @media (max-width: 768px) {
                    .pricing-grid {
                        flex-direction: column;
                        align-items: center;
                    }
                }

                .pricing-card {
                    flex: 1;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.07);
                    border-radius: 24px;
                    padding: 2.5rem;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    backdrop-filter: blur(10px);
                }

                .pricing-card:hover {
                    transform: translateY(-5px);
                    border-color: rgba(123, 47, 255, 0.3);
                    background: rgba(255, 255, 255, 0.05);
                }

                .pricing-card.premium-glow {
                    border-color: var(--border-accent);
                    box-shadow: 0 0 30px rgba(123, 47, 255, 0.15);
                }

                .pricing-card.premium-glow:hover {
                    box-shadow: 0 0 40px rgba(123, 47, 255, 0.3);
                    border-color: var(--accent-purple-light);
                }

                .card-popular-badge {
                    position: absolute;
                    top: -12px;
                    right: 24px;
                    background: rgba(123, 47, 255, 0.2);
                    border: 1px solid var(--border-accent);
                    color: var(--accent-purple-light);
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.65rem;
                    font-weight: 700;
                    letter-spacing: 0.05em;
                }

                .card-premium-badge {
                    position: absolute;
                    top: -12px;
                    right: 24px;
                    background: rgba(0, 212, 255, 0.2);
                    border: 1px solid var(--border-cyan);
                    color: var(--accent-cyan);
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.65rem;
                    font-weight: 700;
                    letter-spacing: 0.05em;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .card-header h3 {
                    font-size: 1.6rem;
                    margin-bottom: 0.5rem;
                    font-weight: 700;
                }

                .card-desc {
                    color: var(--text-secondary);
                    font-size: 0.85rem;
                    line-height: 1.5;
                    margin-bottom: 1.5rem;
                }

                .price-box {
                    display: flex;
                    align-items: baseline;
                    margin-bottom: 2rem;
                }

                .price-box .currency {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.6);
                }

                .price-box .price-val {
                    font-size: 3rem;
                    font-weight: 800;
                    font-family: 'Outfit', sans-serif;
                    line-height: 1;
                }

                .price-box .period {
                    font-size: 0.9rem;
                    color: var(--text-muted);
                    margin-left: 4px;
                }

                .card-body {
                    flex: 1;
                    margin-bottom: 2.5rem;
                }

                .features-list {
                    list-style: none;
                    display: flex;
                    flex-direction: column;
                    gap: 0.8rem;
                }

                .features-list li {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    font-size: 0.88rem;
                    color: rgba(255, 255, 255, 0.8);
                }

                .feat-check {
                    color: var(--accent-purple-light);
                    flex-shrink: 0;
                    margin-top: 2px;
                }

                .feat-check.cyan {
                    color: var(--accent-cyan);
                }

                .pay-btn {
                    display: block;
                    width: 100%;
                    padding: 1rem;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 0.95rem;
                    text-align: center;
                    text-decoration: none;
                    transition: all 0.2s;
                    cursor: pointer;
                }

                .pay-btn.standard {
                    background: rgba(255, 255, 255, 0.08);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .pay-btn.standard:hover {
                    background: rgba(255, 255, 255, 0.15);
                    border-color: rgba(255, 255, 255, 0.2);
                    transform: translateY(-2px);
                }

                .pay-btn.premium {
                    background: linear-gradient(135deg, var(--accent-purple), #5a1fd1);
                    color: white;
                    border: none;
                    box-shadow: 0 4px 15px rgba(123, 47, 255, 0.35);
                }

                .pay-btn.premium:hover {
                    box-shadow: 0 6px 20px rgba(123, 47, 255, 0.5);
                    transform: translateY(-2px);
                    filter: brightness(1.1);
                }

                /* BETA PANELS */
                .beta-sim-panel {
                    width: 100%;
                    max-width: 900px;
                    background: rgba(0, 212, 255, 0.03);
                    border: 1px dashed var(--border-cyan);
                    border-radius: 20px;
                    padding: 1.8rem;
                    margin-bottom: 2rem;
                }

                .sim-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-family: 'Outfit', sans-serif;
                    font-weight: 700;
                    font-size: 1rem;
                    color: white;
                    margin-bottom: 0.5rem;
                }

                .beta-sim-panel p {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    margin-bottom: 1.2rem;
                }

                .sim-actions {
                    display: flex;
                    gap: 1rem;
                }

                .sim-btn {
                    flex: 1;
                    padding: 0.8rem;
                    border-radius: 10px;
                    font-weight: 600;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .sim-btn.pro {
                    background: rgba(123, 47, 255, 0.15);
                    border: 1px solid var(--border-accent);
                    color: var(--accent-purple-light);
                }

                .sim-btn.pro:hover:not(:disabled) {
                    background: rgba(123, 47, 255, 0.25);
                    transform: translateY(-1px);
                }

                .sim-btn.elite {
                    background: rgba(0, 212, 255, 0.1);
                    border: 1px solid var(--border-cyan);
                    color: var(--accent-cyan);
                }

                .sim-btn.elite:hover:not(:disabled) {
                    background: rgba(0, 212, 255, 0.2);
                    transform: translateY(-1px);
                }

                .sim-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .paywall-footer {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }

                .back-btn {
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    font-size: 0.85rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: color 0.2s;
                }

                .back-btn:hover {
                    color: white;
                }

                .secure-text {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }
            `}</style>
        </div>
    );
};

export default SubscriptionBarrier;
