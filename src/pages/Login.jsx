import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Login = () => {
  const { user, loginWithGoogle, loginWithMicrosoft } = useAuth();
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState('');

  // Si ya está logueado, mandarlo al dashboard
  if (user) return <Navigate to="/dashboard" />;

  const handleLogin = async (providerFunc) => {
    setRedirecting(true);
    setError('');
    try {
      await providerFunc();
      // signInWithRedirect no resuelve aquí, el navegador se va a Google
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setError(err.message || 'Error de autenticación');
      setRedirecting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-sparkle">🧠</div>
          <h1>AlgoritmIA</h1>
          <p>Market Intelligence for Elite Creators</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255,80,80,0.15)',
            border: '1px solid rgba(255,80,80,0.3)',
            borderRadius: '8px',
            padding: '0.8rem',
            marginBottom: '1rem',
            fontSize: '0.85rem',
            color: '#ff6b6b'
          }}>
            ⚠️ {error}
          </div>
        )}

        <div className="login-options">
          <button
            className="login-btn google-btn"
            onClick={() => handleLogin(loginWithGoogle)}
            disabled={redirecting}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
            {redirecting ? 'Redirigiendo a Google...' : 'Continuar con Google'}
          </button>

          <button
            className="login-btn microsoft-btn"
            onClick={() => handleLogin(loginWithMicrosoft)}
            disabled={redirecting}
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" />
            {redirecting ? 'Redirigiendo...' : 'Continuar con Microsoft'}
          </button>
        </div>

        <div className="login-footer">
          <p>Al continuar, aceptas nuestros términos y la política de privacidad de datos.</p>
        </div>
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at top right, #1a1a2e, #0f0f1a);
          color: white;
          font-family: 'Inter', sans-serif;
          padding: 2rem;
        }

        .login-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 3rem;
          width: 100%;
          max-width: 450px;
          text-align: center;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: fadeIn 0.8s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .logo-sparkle {
          font-size: 3rem;
          margin-bottom: 1rem;
          text-shadow: 0 0 20px rgba(78, 204, 163, 0.5);
        }

        .login-card h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          background: linear-gradient(to right, #4ecca3, #45b7d1);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .login-header p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 1rem;
          margin-bottom: 2.5rem;
        }

        .login-options {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .login-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          color: white;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .login-btn:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .login-btn img {
          width: 20px;
          height: 20px;
        }

        .login-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
          border-color: #4ecca3;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
        }

        .login-footer {
          margin-top: 3rem;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </div>
  );
};

export default Login;
