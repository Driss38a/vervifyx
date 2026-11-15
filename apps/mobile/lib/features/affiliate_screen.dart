import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class AffiliateScreen extends StatelessWidget {
  final String affiliateId;

  const AffiliateScreen({super.key, this.affiliateId = "driss38"});

  @override
  Widget build(BuildContext context) {
    final String affiliateLink = "https://vervifyx.com/ref/$affiliateId";

    return Scaffold(
      appBar: AppBar(
        title: const Text("نظام التسويق بالعمولة"),
        centerTitle: true,
      ),
      body: Directionality(
        textDirection: TextDirection.rtl,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // بطاقة الأرباح والإحصائيات
              Card(
                elevation: 3,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildStatItem("النقرات", "0", Icons.ads_click),
                      _buildStatItem("المبيعات", "0", Icons.shopping_bag),
                      _buildStatItem("الأرباح", "0.00 \$", Icons.monetization_on),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // قسم رابط الإحالة الخاص
              const Text(
                "رابط الإحالة الخاص بك (Affiliate Link):",
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                decoration: BoxDecoration(
                  color: Colors.grey.shade200,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.grey.shade400),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        affiliateLink,
                        style: const TextStyle(fontSize: 14, color: Colors.blue),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.copy, color: Colors.blue),
                      onPressed: () {
                        Clipboard.setData(ClipboardData(text: affiliateLink));
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text("تم نسخ رابط الإحالة بنجاح!"),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                "شارك هذا الرابط مع أصدقائك أو على منصات التواصل، وستحصل على عمولتك تلقائياً عند كل عملية شراء تتم من خلاله.",
                style: TextStyle(color: Colors.grey, fontSize: 13),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: Colors.blue, size: 28),
        const SizedBox(height: 6),
        Text(
          value,
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        Text(
          label,
          style: const TextStyle(color: Colors.grey, fontSize: 13),
        ),
      ],
    );
  }
}