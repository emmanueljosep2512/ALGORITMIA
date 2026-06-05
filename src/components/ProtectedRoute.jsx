import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading, logout } = useAuth();
    const [authError, setAuthError] = useState(null);

    useEffect(() => {
        if (!loading && user) {
            const adminEmailsStr = import.meta.env.VITE_ADMIN_EMAILS || '';
            const adminEmails = adminEmailsStr.split(',').map(email => email.trim().toLowerCase());
            
            if (!adminEmails.includes(user.email?.toLowerCase())) {
                setAuthError('Acceso denegado: Esta versión Beta es de acceso exclusivo para el administrador.');
                logout();
            }
        }
    }, [user, loading, logout]);

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

    return children;
};

export default ProtectedRoute;
