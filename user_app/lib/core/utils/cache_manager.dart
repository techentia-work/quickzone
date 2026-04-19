import 'package:flutter_cache_manager/flutter_cache_manager.dart';

class AppCacheManager {
  static const key = 'customCacheKey';
  static CacheManager instance = CacheManager(
    Config(
      key,
      stalePeriod: const Duration(days: 90), // 🔥 PERSISTENT FOR 90 DAYS
      maxNrOfCacheObjects: 2000,           // 🔥 SAVE UP TO 2000 IMAGES
      repo: JsonCacheInfoRepository(databaseName: key),
      fileService: HttpFileService(),
    ),
  );
}
