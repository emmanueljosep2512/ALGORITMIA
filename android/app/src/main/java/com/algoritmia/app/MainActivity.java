package com.algoritmia.app;

import android.os.Bundle;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Instalar el SplashScreen ANTES del super.onCreate()
        // Esto evita la pantalla negra y muestra el logo de AlgoritmIA
        SplashScreen.installSplashScreen(this);
        super.onCreate(savedInstanceState);
    }
}
