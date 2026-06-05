import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowUnsubscribed = false }) => {
    const { user, loading, logout } = useAuth();
    const [authError, setAuthError] = useState(null);
    const [needsSubscription, setNeedsSubscription] = useState(false);

    useEffect(() => {
        if (!loading && user) {
            const adminEmailsStr = import.meta.env.VITE_ADMIN_EMAILS || '';
            const adminEmails = adminEmailsStr.split(',').map(email => email.trim().toLowerCase());
            
            if (!adminEmails.includes(user.email?.toLowerCase())) {
                setAuthError('Acceso denegado: Esta versión Beta es de acceso exclusivo para el administrador.');
                logout();
                return;
            }

            if (!allowUnsubscribed) {
                const isSubscribed = localStorage.getItem('algoritmia_subscribed') === 'true';
                if (!isSubscribed) {
                    setNeedsSubscription(true);
                } else {
                    setNeedsSubscription(false);
                }
            } else {
                setNeedsSubscription(false);
            }
        }
    }, [user, loading, logout, allowUnsubscribed]);

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0f0f1a',
                color: '#4ecca3'
            }}>
                <div className="spinner">Cargando Sesión...</div>
            </div>
        );
    }

    if (authError) {
        return <Navigate to="/login" state={{ error: authError }} replace />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (needsSubscription && !allowUnsubscribed) {
        return <Navigate to="/suscripcion" replace />;
    }

    return children;
};

export default ProtectedRoute;
