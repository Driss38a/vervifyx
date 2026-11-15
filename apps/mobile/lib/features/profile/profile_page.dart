import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/i18n.dart';
import 'package:vervifyx/design/language_picker.dart'; // الاستدعاء المركزي الحقيقي للـ Picker
import '../affiliate_screen.dart';
import '../ads/ads_manager_page.dart';
import '../admin/admin_panel.dart';

class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  String _safeTranslate(BuildContext context, String key, String fallback) {
    try {
      final res = context.tr(key);
      return (res.isEmpty || res == key) ? fallback : res;
    } catch (_) {
      return fallback;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_safeTranslate(context, 'profile', 'الملف الشخصي - لوحة المالك')),
        backgroundColor: Colors.blue[800],
        foregroundColor: Colors.white,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          // معلومات صاحب المنصة
          const UserAccountsDrawerHeader(
            accountName: Text('Driss Elkarmam (مدير المنصة)', style: TextStyle(fontWeight: FontWeight.bold)),
            accountEmail: Text('driss@vervifyx.com'),
            currentAccountPicture: CircleAvatar(
              backgroundColor: Colors.white,
              child: Icon(Icons.admin_panel_settings, size: 40, color: Colors.blue),
            ),
            decoration: BoxDecoration(color: Colors.blue),
          ),
          const SizedBox(height: 10),

          // قسم صلاحيات الأدمن والتحكم الشامل
          const Text(
            'إدارة المنصة (خاص بالمالك)',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.blue),
          ),
          const SizedBox(height: 8),

          Card(
            elevation: 1,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.dashboard_customize, color: Colors.indigo),
                  title: const Text('لوحة تحكم الأدمن الشاملة'),
                  subtitle: const Text('الانتقال إلى لوحة المشرف العام'),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const AdminPanelScreen()),
                    );
                  },
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.campaign, color: Colors.orange),
                  title: const Text('إدارة الحملات الإعلانية'),
                  subtitle: const Text('متابعة وتعديل الإعلانات الممولة'),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const AdManagerPage()),
                    );
                  },
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.monetization_on, color: Colors.green),
                  title: const Text('نظام التسويق بالعمولة'),
                  subtitle: const Text('شارك رابطك واربح عمولات'),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const AffiliateScreen()),
                    );
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // إعدادات التطبيق العامة
          const Text(
            'الإعدادات العامة',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.blue),
          ),
          const SizedBox(height: 8),

          Card(
            elevation: 1,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.language, color: Colors.blueGrey),
                  title: Text(_safeTranslate(context, 'change_language', 'تغيير اللغة')),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  // الاستدعاء المركزي الصافي من language_picker.dart بدون أي كود مكرر هنا
                  onTap: () => showLanguagePicker(context),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.logout, color: Colors.red),
                  title: Text(
                    _safeTranslate(context, 'logout', 'تسجيل الخروج'),
                    style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
                  ),
                  onTap: () => context.go('/login'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}