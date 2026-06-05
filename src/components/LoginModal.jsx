import { X, Mail, Chrome, Globe, ShieldCheck } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onLogin }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="login-modal" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
                    <X size={20} />
                </button>

                <div className="login-header">
                    <div className="logo-text-premium" style={{ fontSize: '1.5rem', marginBottom: 12 }}>
                        ALGORITM<span>.IA</span>
                    </div>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: 8 }}>Bienvenido al Cerebro</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Identifícate para acceder a los datos de la red neuronal.</p>
                </div>

                <div className="login-btn-group">
                    <button className="btn-auth-provider" onClick={() => onLogin('google')}>
                        <Chrome size={20} /> Continuar con Google
                    </button>
                    <button className="btn-auth-provider" onClick={() => onLogin('microsoft')}>
                        <Mail size={20} /> Continuar con Microsoft
                    </button>
                </div>

                <div className="auth-divider">o usa tu correo</div>

                <div className="auth-form">
                    <input type="email" placeholder="tu@email.com" />
                    <button className="btn-primary-glow" style={{ width: '100%', padding: 14 }} onClick={() => onLogin('email')}>
                        Entrar con Email
                    </button>
                </div>

                <div style={{ marginTop: 24, fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                    <ShieldCheck size={12} />
                    <span>Acceso verificado para evitar multicuentas.</span>
                </div>
            </div>
        </div>
    );
}
