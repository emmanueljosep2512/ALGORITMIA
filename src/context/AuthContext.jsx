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
import {
    getFirestore,
    doc,
    setDoc,
    onSnapshot,
    serverTimestamp
} from 'firebase/firestore';

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
const db = getFirestore(app);
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeSnapshot = null;

        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const userDocRef = doc(db, 'users', firebaseUser.uid);

                // Configurar el listener en tiempo real del documento del usuario
                unsubscribeSnapshot = onSnapshot(userDocRef, async (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        
                        // Sincronizar localmente en localStorage (mantiene compatibilidad)
                        localStorage.setItem('algoritmia_subscribed', data.subscribed ? 'true' : 'false');
                        localStorage.setItem('algoritmia_plan', data.plan || 'Gratuito');
                        localStorage.setItem('algoritmia_credits', (data.credits ?? 0).toString());
                        localStorage.setItem('algoritmia_credits_total', (data.creditsTotal ?? 0).toString());
                        
                        // Disparar eventos para actualizar Sidebar y Dashboard
                        window.dispatchEvent(new Event('storage'));
                        window.dispatchEvent(new Event('creditsUpdated'));
                    } else {
                        // Si no existe el documento, inicializar perfil en Firestore
                        const initialData = {
                            email: firebaseUser.email || '',
                            subscribed: false,
                            plan: 'Gratuito',
                            credits: 5,
                            creditsTotal: 5,
                            createdAt: serverTimestamp()
                        };
                        try {
                            await setDoc(userDocRef, initialData);
                        } catch (err) {
                            console.error("Error al inicializar usuario en Firestore:", err.message);
                        }
                    }
                });

                setUser(firebaseUser);
            } else {
                // Si se cierra sesión, limpiar el listener
                if (unsubscribeSnapshot) {
                    unsubscribeSnapshot();
                    unsubscribeSnapshot = null;
                }
                setUser(null);
            }
            setLoading(false);
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeSnapshot) unsubscribeSnapshot();
        };
    }, []);

    const loginWithGoogle = () => {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    };

    const loginWithMicrosoft = () => {
        const provider = new OAuthProvider('microsoft.com');
        return signInWithPopup(auth, provider);
    };

    const logout = () => {
        localStorage.removeItem('algoritmia_subscribed');
        localStorage.removeItem('algoritmia_plan');
        localStorage.removeItem('algoritmia_credits');
        localStorage.removeItem('algoritmia_credits_total');
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('creditsUpdated'));
        return signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginWithMicrosoft, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

