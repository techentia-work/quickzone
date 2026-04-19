// core/network/dio_client.dart
import 'dart:io';
import 'package:quickzone_delivery/core/network/auth_interceptor.dart';
import 'package:cookie_jar/cookie_jar.dart';
import 'package:dio/dio.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'cache_interceptor.dart';

final navigatorKey = GlobalKey<NavigatorState>();

final dioProvider = Provider<Dio>((ref) {
  final apiUrl = dotenv.env['API_URL'] ?? 'http://192.168.1.28:8080/api';

  final dio = Dio(BaseOptions(
    baseUrl: apiUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
    headers: {'Content-Type': 'application/json'},
  ));

  final appDocDir = Directory.systemTemp; // Or use getApplicationDocumentsDirectory() if using path_provider
  final cookieJar = PersistCookieJar(
    storage: FileStorage('${appDocDir.path}/.cookies/'),
  );

  dio.interceptors.add(CookieManager(cookieJar));
  // dio.interceptors.add(CacheInterceptor());
  dio.interceptors.add(AuthInterceptor(ref, navigatorKey));


  dio.interceptors.add(LogInterceptor(
    // request: true,
    requestBody: true,
    responseBody: true,
    // error: true,
  ));

  return dio;
});