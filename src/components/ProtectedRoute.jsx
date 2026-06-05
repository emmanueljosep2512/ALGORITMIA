import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

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

    if (!user) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;
