import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Search, Compass, Flame, TrendingUp, Cpu, Zap, WifiOff, Sparkles, Instagram, Smartphone } from 'lucide-react';
import { checkHealth } from '../services/api';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Trending Ahora', badge: null },
    { to: '/buscar', icon: Search, label: 'Buscar Videos', badge: null },
    { to: '/nichos', icon: Compass, label: 'Buscar Nichos', badge: null },
    { to: '/analizador', icon: Sparkles, label: 'Analizar Video', badge: 'NUEVO' },
];

export default function Sidebar() {
    const { logout } = useAuth();
    const [health, setHealth] = useState({ ok: false, loading: true });
    const [subscription, setSubscription] = useState({
        plan: localStorage.getItem('algoritmia_plan') || 'BETA (DEMO)',
        credits: parseInt(localStorage.getItem('algoritmia_credits') || '0', 10),
        creditsTotal: parseInt(localStorage.getItem('algoritmia_credits_total') || '0', 10),
    });

    useEffect(() => {
        async function getHealth() {
            const h = await checkHealth();
            setHealth({ ...h, loading: false });
        }
        const timer = setInterval(getHealth, 30000);
        getHealth();

        const updateSubscription = () => {
            setSubscription({
                plan: localStorage.getItem('algoritmia_plan') || 'BETA (DEMO)',
                credits: parseInt(localStorage.getItem('algoritmia_credits') || '0', 10),
                creditsTotal: parseInt(localStorage.getItem('algoritmia_credits_total') || '0', 10),
            });
        };

        window.addEventListener('storage', updateSubscription);
        window.addEventListener('creditsUpdated', updateSubscription);

        return () => {
            clearInterval(timer);
            window.removeEventListener('storage', updateSubscription);
            window.removeEventListener('creditsUpdated', updateSubscription);
        };
    }, []);

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <NavLink Array to="/dashboard" className="logo-link">
                    <img
                        src="/logo_algoritmia.svg"
                        alt="AlgoritmIA"
                        className="logo-img-main"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="logo-text-premium">
                        ALGORITM<span>.IA</span>
                    </div>
                </NavLink>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section-label">Principal</div>
                {NAV_ITEMS.map(({ to, icon: Icon, label, badge }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                    >
                        <Icon className="nav-icon" />
                        {label}
                        {badge && <span className="new-badge">{badge}</span>}
                    </NavLink>
                ))}

                <div className="nav-section-label" style={{ marginTop: 16 }}>Inteligencia</div>
                <NavLink
                    to="/nichos?market=ALL"
                    className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                >
                    <Flame className="nav-icon" />
                    Tendencias
                </NavLink>

                <div className="nav-section-label" style={{ marginTop: 16 }}>Meta Intelligence</div>
                <NavLink
                    to="/meta"
                    className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                >
                    <Instagram className="nav-icon" style={{ color: '#e1306c' }} />
                    IG & FB Intelligence
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <div className={`brain-status ${health.ok ? 'active' : 'inactive'}`}>
                    <div className="brain-pulse">
                        <Cpu size={14} />
                    </div>
                    <div className="brain-info">
                        <div className="brain-name">Cerebro AlgoritmIA</div>
                        <div className="brain-state">
                            {health.loading ? 'Sincronizando...' : (
                                health.ok ? (
                                    <span style={{ color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <TrendingUp size={10} /> Red Neuronal Activa
                                    </span>
                                ) : (
                                    <span style={{ color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Zap size={10} /> Conectado al Cerebro IA
                                    </span>
                                )
                            )}
                        </div>
                    </div>
                </div>

                <div className="plan-badge" style={{ marginTop: 12 }}>
                    <div className="plan-badge-label">Plan Actual</div>
                    <div className="plan-badge-name" style={{ fontSize: '0.9rem' }}>
                        ⚡ {subscription.plan}
                    </div>
                    <div className="plan-badge-credits" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                        <span>Consultas:</span>
                        <strong style={{ color: subscription.credits > 0 ? 'var(--accent-cyan)' : 'var(--accent-red)' }}>
                            {subscription.credits} / {subscription.creditsTotal}
                        </strong>
                    </div>
                    <a
                        href="https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=emmanueljosep2512@gmail.com&currency_code=USD&amount=9.99&item_name=AlgoritmIA%20-%20Recarga%2050%20Creditos"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="subscribe-btn"
                    >
                        <Zap size={10} fill="currentColor" /> Recargar
                    </a>
                </div>

                <a
                    href="/algoritmia.apk"
                    download="algoritmia.apk"
                    className="sidebar-download-apk-btn"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        width: '100%',
                        marginTop: 12,
                        padding: '10px',
                        background: 'linear-gradient(135deg, rgba(0, 243, 255, 0.05) 0%, rgba(0, 102, 255, 0.05) 100%)',
                        border: '1px solid rgba(0, 243, 255, 0.15)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--accent-cyan)',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 4px 12px rgba(0, 243, 255, 0.05)',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 243, 255, 0.15) 0%, rgba(0, 102, 255, 0.15) 100%)';
                        e.currentTarget.style.borderColor = 'rgba(0, 243, 255, 0.4)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 243, 255, 0.15), inset 0 0 12px rgba(0, 243, 255, 0.1)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 243, 255, 0.05) 0%, rgba(0, 102, 255, 0.05) 100%)';
                        e.currentTarget.style.borderColor = 'rgba(0, 243, 255, 0.15)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 243, 255, 0.05)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <Smartphone size={14} className="nav-icon" />
                    Descargar App (APK)
                </a>

                <button
                    onClick={() => logout()}
                    className="sidebar-logout-btn"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        width: '100%',
                        marginTop: 10,
                        padding: '8px',
                        background: 'rgba(255, 80, 80, 0.08)',
                        border: '1px solid rgba(255, 80, 80, 0.15)',
                        borderRadius: 'var(--radius-md)',
                        color: '#ff6b6b',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 80, 80, 0.15)';
                        e.currentTarget.style.borderColor = 'rgba(255, 80, 80, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 80, 80, 0.08)';
                        e.currentTarget.style.borderColor = 'rgba(255, 80, 80, 0.15)';
                    }}
                >
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    );
}
