import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../features/auth/login_page.dart';
import '../features/auth/register_page.dart';
import '../features/home/home_page.dart';
import '../features/market/market_page.dart';
import '../features/chat/chat_page.dart';
import '../features/profile/profile_page.dart';
// استيراد ملف التنقل الجديد ذو الـ 6 تبويبات
import '../features/home/main_navigation_page.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/main', // تم الضبط ليبدأ مباشرة من الواجهة الاجتماعية الجديدة
    routes: [
      // المسار الرئيسي الجديد الذي يحتوي على الـ 6 تبويبات السفليّة
      GoRoute(path: '/main', builder: (context, state) => const MainNavigationPage()),
      
      // مسارات المصادقة والصفحات الفردية
      GoRoute(path: '/login', builder: (context, state) => const LoginPage()),
      GoRoute(path: '/register', builder: (context, state) => const RegisterPage()),
      GoRoute(path: '/home', builder: (context, state) => const HomePage()),
      GoRoute(path: '/market', builder: (context, state) => const MarketPage()),
      GoRoute(path: '/chat', builder: (context, state) => const ChatPage()),
      GoRoute(path: '/profile', builder: (context, state) => const ProfilePage()),
    ],
  );
});