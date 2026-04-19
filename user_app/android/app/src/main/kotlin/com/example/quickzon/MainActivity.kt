package com.example.quickzon

import android.os.Bundle
import io.flutter.embedding.android.FlutterActivity
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen

class MainActivity: FlutterActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        // Install splash screen BEFORE super.onCreate()
        //        installSplashScreen()
        //        super.onCreate(savedInstanceState)

//        setTheme(R.style.LaunchTheme) // apply splash theme
        super.onCreate(savedInstanceState)
//        setContentView(R.layout.splash_screen) // load your custom layout
    }
}