package com.example.delivery_boy_app

import io.flutter.embedding.android.FlutterActivity
import android.os.Bundle
import io.flutter.plugins.GeneratedPluginRegistrant

class MainActivity: FlutterActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Create the channel (only needed once)
        val channel = android.app.NotificationChannel(
            "high_importance_channel",
            "High Importance Notifications",
            android.app.NotificationManager.IMPORTANCE_HIGH
        ).apply {
            description = "Important order updates"
        }
        val manager = getSystemService(android.app.NotificationManager::class.java)
        manager.createNotificationChannel(channel)
    }
}
