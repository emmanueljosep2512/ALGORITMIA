import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Search, Compass, Flame, TrendingUp, Cpu, Zap, WifiOff } from 'lucide-react';
import { checkHealth } from '../services/api';

const NAV_ITEMS = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Trending Ahora', badge: null },
    { to: '/buscar', icon: Search, label: 'Buscar Videos', badge: null },
    { to: '/nichos', icon: Compass, label: 'Buscar Nichos', badge: 'NUEVO' },
];

export default function Sidebar() {
    const [health, setHealth] = useState({ ok: false, loading: true });

    useEffect(() => {
        async function getHealth() {
            const h = await checkHealth();
            setHealth({ ...h, loading: false });
        }
        const timer = setInterval(getHealth, 30000);
        getHealth();
        return () => clearInterval(timer);
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
                    <div className="plan-badge-name">⚡ PRO</div>
                </div>
            </div>
        </aside>
    );
}
