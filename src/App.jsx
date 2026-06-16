import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, NavLink } from 'react-router-dom';
import { LayoutDashboard, Search, Compass, Sparkles, Instagram, LogOut } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import VideoSearch from './pages/VideoSearch';
import NicheFinder from './pages/NicheFinder';
import Landing from './pages/Landing';
import Login from './pages/Login';
import VideoModal from './components/VideoModal';
import ProtectedRoute from './components/ProtectedRoute';
import VideoAnalyzer from './pages/VideoAnalyzer';
import MetaIntelligence from './pages/MetaIntelligence';
import SubscriptionBarrier from './pages/SubscriptionBarrier';
import { AuthProvider, useAuth } from './context/AuthContext';

function MobileNav() {
    const { logout } = useAuth();
    return (
        <nav className="mobile-nav" style={{ display: 'none' }}>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
                <LayoutDashboard size={20} /><span>Inicio</span>
            </NavLink>
            <NavLink to="/buscar" className={({ isActive }) => isActive ? 'active' : ''}>
                <Search size={20} /><span>Buscar</span>
            </NavLink>
            <NavLink to="/nichos" className={({ isActive }) => isActive ? 'active' : ''}>
                <Compass size={20} /><span>Nichos</span>
            </NavLink>
            <NavLink to="/analizador" className={({ isActive }) => isActive ? 'active' : ''}>
                <Sparkles size={20} /><span>Analizar</span>
            </NavLink>
            <NavLink to="/meta" className={({ isActive }) => isActive ? 'active' : ''}>
                <Instagram size={20} style={{ color: '#e1306c' }} /><span>Meta</span>
            </NavLink>
            <button onClick={() => logout()}>
                <LogOut size={20} /><span>Salir</span>
            </button>
        </nav>
    );
}

function AppContent({ setPlayingVideo }) {
    const location = useLocation();
    const isPublic = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/suscripcion';

    return (
        <div className={`app-layout ${isPublic ? 'landing-layout' : ''}`}>
            {!isPublic && <Sidebar />}
            <div className="main-content">
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/suscripcion"
                        element={
                            <ProtectedRoute allowUnsubscribed={true}>
                                <SubscriptionBarrier />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard onPlayVideo={setPlayingVideo} />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/buscar"
                        element={
                            <ProtectedRoute>
                                <VideoSearch onPlayVideo={setPlayingVideo} />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/nichos"
                        element={
                            <ProtectedRoute>
                                <NicheFinder />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/analizador"
                        element={
                            <ProtectedRoute>
                                <VideoAnalyzer />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/meta"
                        element={
                            <ProtectedRoute>
                                <MetaIntelligence />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </div>
            {!isPublic && <MobileNav />}
        </div>
    );
}


export default function App() {
    const [playingVideo, setPlayingVideo] = useState(null);

    return (
        <AuthProvider>
            <BrowserRouter>
                <AppContent setPlayingVideo={setPlayingVideo} />

                {playingVideo && (
                    <VideoModal
                        video={playingVideo}
                        onClose={() => setPlayingVideo(null)}
                    />
                )}
            </BrowserRouter>
        </AuthProvider>
    );
}
