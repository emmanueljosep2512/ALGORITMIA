import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    getAuth,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    OAuthProvider
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';

// Configuración real desde las variables de entorno de Vite
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Ya no es necesario getRedirectResult al usar signInWithPopup

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const loginWithGoogle = () => {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    };

    const loginWithMicrosoft = () => {
        const provider = new OAuthProvider('microsoft.com');
        return signInWithPopup(auth, provider);
    };

    const logout = () => signOut(auth);

    return (
        <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginWithMicrosoft, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
