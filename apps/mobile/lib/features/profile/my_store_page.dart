import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ProfileMyStorePage extends StatelessWidget {
  const ProfileMyStorePage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('متجري وإدارة الإعلانات', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          // رأس المتجر
          Center(
            child: Stack(
              children: [
                const CircleAvatar(
                  radius: 45,
                  child: Icon(Icons.storefront_rounded, size: 50),
                ),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: CircleAvatar(
                    radius: 16,
                    backgroundColor: theme.colorScheme.primary,
                    child: const Icon(Icons.verified, size: 18, color: Colors.white),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          const Center(
            child: Text('متجر درب إكسبريس (Derb Express)', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          ),
          const Center(
            child: Text('متجرك المتكامل للأدوات الرقمية والتقنية', style: TextStyle(color: Colors.grey)),
          ),
          const SizedBox(height: 24),

          // قسم الحملات الإعلانية السريعة
          Card(
            elevation: 2,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.campaign_rounded, color: theme.colorScheme.primary, size: 28),
                      const SizedBox(width: 8),
                      const Text('إدارة الحملات الإعلانية', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Text('أطلق حملة إعلانية لمتجرك أو لمنتج محدد ليظهر مباشرة في الواجهة الرئيسية لكل مستخدمي المنصة.'),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          icon: const Icon(Icons.store_rounded),
                          label: const Text('إعلان للمتجر'),
                          onPressed: () {
                            _showAdCampaignDialog(context, 'إعلان للمتجر ككل');
                          },
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton.icon(
                          icon: const Icon(Icons.local_fire_department_rounded),
                          label: const Text('إعلان لمنتج'),
                          onPressed: () {
                            _showAdCampaignDialog(context, 'إعلان لمنتج مميز');
                          },
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // زر إضافة منتج جديد للمتجر
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            icon: const Icon(Icons.add_shopping_cart_rounded),
            label: const Text('إضافة منتج جديد لمتجري', style: TextStyle(fontSize: 16)),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('تم فتح نافذة إضافة منتج جديد...')),
              );
            },
          ),
        ],
      ),
    );
  }

  // نافذة منبثقة لإعداد وإطلاق الحملة الإعلانية بسرعة
  void _showAdCampaignDialog(BuildContext context, String campaignType) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(campaignType),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('حدد ميزانية الحملة ومدة الظهور في الواجهة الرئيسية (Feed):'),
            const SizedBox(height: 12),
            const TextField(
              decoration: InputDecoration(
                labelText: 'الميزانية (بالعملة المحلية أو النقاط)',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 12),
            const TextField(
              decoration: InputDecoration(
                labelText: 'الرسالة الترويجية أو عنوان الإعلان',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إلغاء'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('تم إطلاق الحملة الإعلانية بنجاح وتظهر الآن في الواجهة! 🚀')),
              );
            },
            child: const Text('إطلاق الحملة'),
          ),
        ],
      ),
    );
  }
}