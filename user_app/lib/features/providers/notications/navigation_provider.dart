import 'package:Quickzon/core/network/dio_client.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';


final navigatorKeyProvider = Provider<GlobalKey<NavigatorState>>((ref) {
  return navigatorKey;
});
