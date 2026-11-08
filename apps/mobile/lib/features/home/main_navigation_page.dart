import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// استيراد الواجهات الحالية
import '../market/market_page.dart';
import '../market/stores_page.dart';

class MainNavigationPage extends ConsumerStatefulWidget {
  const MainNavigationPage({super.key});

  @override
  ConsumerState<MainNavigationPage> createState() => _MainNavigationPageState();
}

class _MainNavigationPageState extends ConsumerState<MainNavigationPage> {
  int _currentIndex = 0;

  // قائمة التبويبات الـ 6 الرئيسية للمنصة
  final List<Widget> _pages = [
    const SocialFeedPage(),     // 1. الواجهة الاجتماعية (Feed)
    const MarketPage(),         // 2. السوق
    const StoresPage(),         // 3. المتاجر المعتمدة
    const ReelsPage(),          // 4. الفيديوهات والريلز
    const ChatListPage(),       // 5. المحادثات والرسائل
    const ProfileMyStorePage(), // 6. البروفايل والمتجر الخاص
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _pages,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home_rounded),
            label: 'الرئيسية',
          ),
          NavigationDestination(
            icon: Icon(Icons.storefront_outlined),
            selectedIcon: Icon(Icons.storefront_rounded),
            label: 'السوق',
          ),
          NavigationDestination(
            icon: Icon(Icons.verified_outlined),
            selectedIcon: Icon(Icons.verified_rounded),
            label: 'المتاجر',
          ),
          NavigationDestination(
            icon: Icon(Icons.video_collection_outlined),
            selectedIcon: Icon(Icons.video_collection_rounded),
            label: 'ريلز',
          ),
          NavigationDestination(
            icon: Icon(Icons.chat_bubble_outline_rounded),
            selectedIcon: Icon(Icons.chat_bubble_rounded),
            label: 'المحادثات',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline_rounded),
            selectedIcon: Icon(Icons.person_rounded),
            label: 'متجري',
          ),
        ],
      ),
    );
  }
}

// ----------------------------------------------------
// واجهات مؤقتة للتبويبات الجديدة (سنطور كلاً منها بالتفصيل)
// ----------------------------------------------------

/// 1. واجهة الخلاصة الاجتماعية (Social Feed)
class SocialFeedPage extends StatelessWidget {
  const SocialFeedPage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('الرئيسية التجاريّة', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(icon: const Icon(Icons.notifications_none_rounded), onPressed: () {}),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                children: [
                  const CircleAvatar(child: Icon(Icons.add_business_rounded)),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Text('انشر منتجاً، كتاباً، أو فيديو جديداً في المنصة...'),
                  ),
                  IconButton(
                    icon: Icon(Icons.post_add_rounded, color: theme.colorScheme.primary),
                    onPressed: () {},
                  )
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: CircleAvatar(
                      backgroundColor: theme.colorScheme.primaryContainer,
                      child: const Icon(Icons.storefront_rounded),
                    ),
                    title: const Text('متجر درب إكسبريس (Derb Express)', style: TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: const Text('منذ 10 دقائق • إلكترونيات وتقنية'),
                    trailing: Icon(Icons.verified_rounded, color: theme.colorScheme.primary, size: 20),
                  ),
                  const SizedBox(height: 8),
                  const Text('تم توفير كمية جديدة من أدوات ومعدات الأتمتة والذكاء الاصطناعي! اطلب الآن مع الدفع عند الاستلام.'),
                  const SizedBox(height: 12),
                  Container(
                    height: 180,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: theme.colorScheme.primary.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(Icons.precision_manufacturing_rounded, size: 64, color: theme.colorScheme.primary),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      TextButton.icon(
                        icon: const Icon(Icons.thumb_up_alt_outlined, size: 18),
                        label: const Text('إعجاب'),
                        onPressed: () {},
                      ),
                      TextButton.icon(
                        icon: const Icon(Icons.chat_outlined, size: 18),
                        label: const Text('تواصل'),
                        onPressed: () {},
                      ),
                      ElevatedButton.icon(
                        icon: const Icon(Icons.shopping_bag_outlined, size: 18),
                        label: const Text('اطلب الآن'),
                        onPressed: () {},
                      ),
                    ],
                  )
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// 4. واجهة الفيديوهات والريلز (Reels Page)
class ReelsPage extends StatelessWidget {
  const ReelsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('ريلز المنتجات والخدمات')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: const [
            Icon(Icons.video_library_rounded, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('عروض الفيديوهات والمنتجات القصيرة لتجار المنصة'),
          ],
        ),
      ),
    );
  }
}

/// 5. واجهة المحادثات (Chat List Page)
class ChatListPage extends StatelessWidget {
  const ChatListPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('المحادثات والرسائل')),
      body: ListView(
        children: const [
          ListTile(
            leading: CircleAvatar(child: Icon(Icons.person)),
            title: Text('دعم متجر درب إكسبريس'),
            subtitle: Text('مرحباً دريس، تم تأكيد طلبك بنجاح!'),
            trailing: Text('10:30 ص'),
          ),
        ],
      ),
    );
  }
}

/// 6. واجهة البروفايل والمتجر الخاص (Profile & My Store Page)
class ProfileMyStorePage extends StatelessWidget {
  const ProfileMyStorePage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('الملف الشخصي والمتجر')),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          const Center(
            child: CircleAvatar(
              radius: 40,
              child: Icon(Icons.person, size: 48),
            ),
          ),
          const SizedBox(height: 12),
          const Center(
            child: Text('دريس (Driss)', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          ),
          const SizedBox(height: 24),
          Card(
            color: theme.colorScheme.primaryContainer.withOpacity(0.4),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: ListTile(
              leading: Icon(Icons.storefront_rounded, color: theme.colorScheme.primary, size: 32),
              title: const Text('إدارة متجري الخاص', style: TextStyle(fontWeight: FontWeight.bold)),
              subtitle: const Text('أضف منتجاتك وفيديوهاتك لتعرض للجميع في المنصة'),
              trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 16),
              onTap: () {},
            ),
          ),
        ],
      ),
    );
  }
}