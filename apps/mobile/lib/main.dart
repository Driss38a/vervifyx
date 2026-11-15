import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'features/home/home_page.dart';
import 'features/market/stores_page.dart';
import 'features/ads/ads_manager_page.dart';
import 'reels_screen.dart';
import 'features/profile/profile_page.dart';

void main() {
  runApp(const ProviderScope(child: VervifyxApp()));
}

class VervifyxApp extends StatelessWidget {
  const VervifyxApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Vervifyx',
      debugShowCheckedModeBanner: false,
      // ثيم موحد يفرض اللون الأزرق الملكي على جميع الـ AppBars في التطبيق
      theme: ThemeData(
        useMaterial3: true,
        primaryColor: const Color(0xFF1565C0),
        scaffoldBackgroundColor: const Color(0xFFF5F6F8),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1565C0),
          primary: const Color(0xFF1565C0),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF1565C0), // اللون الأزرق الملكي الموحد
          foregroundColor: Colors.white,      // النص والأيقونات باللون الأبيض
          elevation: 2,
          centerTitle: false,
          titleTextStyle: TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
          iconTheme: IconThemeData(color: Colors.white),
        ),
      ),
      home: const MainNavigationScreen(),
    );
  }
}

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;

  final List<Widget> _pages = const [
    HomePage(),
    StoresPage(),
    AdManagerPage(),
    ReelsScreen(),
    ProfilePage(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: _pages),
      bottomNavigationBar: NavigationBankBarCustom(_currentIndex, (index) {
        setState(() => _currentIndex = index);
      }),
    );
  }
}

// دالة مبسطة لشريط التنقل السفلي لضمان استقرار التطبيق
class NavigationBankBarCustom extends StatelessWidget {
  final int currentIndex;
  final Function(int) onSelected;

  const NavigationBankBarCustom(this.currentIndex, this.onSelected, {super.key});

  @override
  Widget build(BuildContext context) {
    return NavigationBar(
      selectedIndex: currentIndex,
      onDestinationSelected: onSelected,
      destinations: const [
        NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'الرئيسية'),
        NavigationDestination(icon: Icon(Icons.storefront_outlined), selectedIcon: Icon(Icons.storefront), label: 'المتاجر'),
        NavigationDestination(icon: Icon(Icons.campaign_outlined), selectedIcon: Icon(Icons.campaign), label: 'الإعلانات'),
        NavigationDestination(icon: Icon(Icons.video_collection_outlined), selectedIcon: Icon(Icons.video_collection), label: 'الريلز'),
        NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'حسابي'),
      ],
    );
  }
}