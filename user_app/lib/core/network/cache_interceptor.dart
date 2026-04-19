// core/network/cache_interceptor.dart
import 'package:dio/dio.dart';
import 'package:get_storage/get_storage.dart';

class CacheInterceptor extends Interceptor {
  final Map<String, CacheEntry> _memoryCache = {};
  final GetStorage _storage = GetStorage();
  final Duration defaultCacheDuration = const Duration(minutes: 2);
  final Duration staleWhileRevalidate = const Duration(minutes: 2);

  final List<String> noCacheEndpoints = ['/auth/me', '/user/profile', '/wishlist', '/cart' ,'/help-support'];

  bool _isSensitivePath(String path) => noCacheEndpoints.any((e) => path.contains(e));

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    if (options.method.toUpperCase() != 'GET' || _isSensitivePath(options.path)) {
      _log('Cache SKIPPED', options.path);
      return handler.next(options);
    }

    final cacheKey = _generateCacheKey(options);

    // 1️⃣ Try in-memory cache
    final memEntry = _memoryCache[cacheKey];
    if (memEntry != null && !memEntry.isExpired) {
      _log('Cache HIT: MEMORY', options.path);
      return handler.resolve(_buildResponse(options, memEntry.data, source: 'MEMORY'));
    }

    // 2️⃣ Try persistent cache (GetStorage)
    final localCache = _storage.read(cacheKey);
    if (localCache != null && localCache is Map) {
      final timestamp = DateTime.tryParse(localCache['timestamp'] ?? '');
      final data = localCache['data'];

      if (timestamp != null) {
        final cacheAge = DateTime.now().difference(timestamp);
        final cacheDuration = _getCacheDuration(options);

        // 2a️⃣ If still fresh
        if (cacheAge < cacheDuration) {
          _memoryCache[cacheKey] = CacheEntry(
            data: data,
            expiryTime: DateTime.now().add(cacheDuration),
          );
          _log('Cache HIT: LOCAL', options.path);
          return handler.resolve(_buildResponse(options, data, source: 'LOCAL'));
        }

        // 2b️⃣ If stale but within revalidate window
        if (cacheAge < staleWhileRevalidate) {
          // ✅ Serve stale data instantly
          handler.resolve(_buildResponse(options, data, source: 'STALE'));

          // 🔁 Trigger background refresh
          _log('Cache STALE: serving old → refreshing in background', options.path);
          _refreshCacheInBackground(options, cacheKey);
          return;
        }

        // 2c️⃣ If too old, clear
        _log('Cache EXPIRED: clearing old entry', options.path);
        _storage.remove(cacheKey);
      }
    }

    // 3️⃣ No cache → fetch from network
    _log('Cache MISS → NETWORK', options.path);
    return handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) async {
    if (response.requestOptions.method.toUpperCase() == 'GET' && response.statusCode == 200) {
      final cacheKey = _generateCacheKey(response.requestOptions);
      final duration = _getCacheDuration(response.requestOptions);

      // 🧠 Save memory cache
      _memoryCache[cacheKey] = CacheEntry(data: response.data, expiryTime: DateTime.now().add(duration));

      // 💾 Save persistent cache
      await _storage.write(cacheKey, {'data': response.data, 'timestamp': DateTime.now().toIso8601String()});

      _log('Cache UPDATED', response.requestOptions.path);
      response.headers.add('x-cache', 'MISS');
    }

    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (err.requestOptions.method.toUpperCase() == 'GET') {
      final cacheKey = _generateCacheKey(err.requestOptions);

      // Fallback to cache
      final mem = _memoryCache[cacheKey];
      if (mem != null) {
        _log('Cache FALLBACK: MEMORY (network error)', err.requestOptions.path);
        return handler.resolve(_buildResponse(err.requestOptions, mem.data, source: 'STALE-MEM'));
      }

      final local = _storage.read(cacheKey);
      if (local != null) {
        _log('Cache FALLBACK: LOCAL (network error)', err.requestOptions.path);
        return handler.resolve(_buildResponse(err.requestOptions, local['data'], source: 'STALE-LOCAL'));
      }
    }

    _log('Cache MISS & no fallback (network error)', err.requestOptions.path);
    handler.next(err);
  }

  /// 🪄 Background revalidation — silently updates cache
  void _refreshCacheInBackground(RequestOptions oldOptions, String cacheKey) async {
    final dio = Dio(BaseOptions(
      baseUrl: oldOptions.baseUrl,
      headers: oldOptions.headers,
    ));

    try {
      final response = await dio.fetch(RequestOptions(
        path: oldOptions.path,
        method: 'GET',
        baseUrl: oldOptions.baseUrl,
        headers: oldOptions.headers,
        queryParameters: oldOptions.queryParameters,
      ));

      if (response.statusCode == 200) {
        await _storage.write(cacheKey, {
          'data': response.data,
          'timestamp': DateTime.now().toIso8601String(),
        });

        _memoryCache[cacheKey] = CacheEntry(
          data: response.data,
          expiryTime: DateTime.now().add(_getCacheDuration(oldOptions)),
        );
      }
    } catch (_) {
      _log('Background refresh failed', oldOptions.path);
    }
  }

  // 🔧 Helpers
  Response _buildResponse(RequestOptions options, dynamic data, {String source = 'CACHE'}) {
    return Response(
      requestOptions: options,
      data: data,
      statusCode: 200,
      headers: Headers.fromMap({'x-cache': [source]}),
    );
  }

  String _generateCacheKey(RequestOptions options) {
    final uri = options.uri.toString();
    final query = options.queryParameters.entries.map((e) => '${e.key}=${e.value}').join('&');
    return '$uri?$query';
  }

  Duration _getCacheDuration(RequestOptions options) {
    final path = options.path;
    if (path.contains('/category')) return const Duration(minutes: 5);
    if (path.contains('/product')) return const Duration(minutes: 5);
    return defaultCacheDuration;
  }

  void _log(String message, String path) {
    // You can replace this with logger package or Firebase Crashlytics if needed
    print('[Cache] $message → $path');
  }

  void clearAll() {
    _memoryCache.clear();
    _storage.erase();
    _log('All cache cleared', '');
  }
}

class CacheEntry {
  final dynamic data;
  final DateTime expiryTime;

  CacheEntry({required this.data, required this.expiryTime});

  bool get isExpired => DateTime.now().isAfter(expiryTime);
}