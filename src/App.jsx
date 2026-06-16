import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
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
import { AuthProvider } from './context/AuthContext';

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
