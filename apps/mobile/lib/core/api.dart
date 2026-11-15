import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

// مزود التخزين الآمن لحفظ قراءة الـ JWT Token
final storageProvider = Provider<FlutterSecureStorage>((ref) => const FlutterSecureStorage());

// مزود Dio الرئيسي للاتصال بالخلفية (Backend)
final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(
    // ملاحظة: إذا كنت تجرب على الهاتف الحقيقي، استبدل localhost بأيبي حاسوبك المحلي
    // مثال: 'http://192.168.1.15:4000/api' أو 'http://10.0.2.2:4000/api' للمحاكي
    baseUrl: 'http://localhost:4000/api',
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
  ));
  
  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) async {
      // جلب التوكن تلقائياً وإضافته لهيدر الطلب
      final token = await ref.read(storageProvider).read(key: 'jwt_token');
      if (token != null) {
        options.headers['Authorization'] = 'Bearer $token';
      }
      return handler.next(options);
    },
    onError: (DioException e, handler) {
      if (e.response?.statusCode == 401) {
        // هنا يمكن التعامل مع انتهاء الجلسة (مثلاً إعادة التوجيه لتسجيل الدخول)
      }
      return handler.next(e);
    },
  ));

  return dio;
});