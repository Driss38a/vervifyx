import 'package:flutter/material.dart';

class StoreViewPage extends StatelessWidget {
  final Map? storeData;

  const StoreViewPage({super.key, this.storeData});

  @override
  Widget build(BuildContext context) {
    final store = storeData ?? {};
    final name = store['name']?.toString() ?? 'متجر درب إكسبريس';
    final category = store['category']?.toString() ?? 'تجارة عامة وتقنية';
    final description = store['description']?.toString() ?? 'مرحباً بكم في متجرنا الرقمي على منصة Vervifyx';
    final products = store['products'] is List ? (store['products'] as List) : [];

    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black87),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          name,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.black87),
        ),
        backgroundColor: Colors.white,
        elevation: 1,
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // بطاقة المعلومات الرئيسية للمتجر
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.1),
                    blurRadius: 5,
                    spreadRadius: 1,
                  ),
                ],
              ),
              child: Row(
                children: [
                  const CircleAvatar(
                    radius: 30,
                    backgroundColor: Colors.blueAccent,
                    child: Icon(Icons.storefront, size: 30, color: Colors.white),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Text(category, style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                        const SizedBox(height: 6),
                        Text(description, style: const TextStyle(fontSize: 12, color: Colors.black87)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // عنوان قسم المنتجات
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('معرض المنتجات 🛍️', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                Text('${products.length} منتج', style: const TextStyle(color: Colors.grey, fontSize: 13)),
              ],
            ),
            const SizedBox(height: 10),

            // عرض المنتجات بشكل آمن ومستقر
            products.isEmpty
                ? const Padding(
                    padding: EdgeInsets.all(40.0),
                    child: Center(
                      child: Text('لا توجد منتجات مضافة في هذا المتجر حالياً.', style: TextStyle(color: Colors.grey)),
                    ),
                  )
                : ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: products.length,
                    itemBuilder: (context, index) {
                      final item = products[index] is Map ? products[index] as Map : {};
                      final itemTitle = item['title']?.toString() ?? 'منتج بدون اسم';
                      final itemPrice = item['price']?.toString() ?? 'السعر غير محدد';

                      return Card(
                        margin: const EdgeInsets.only(bottom: 10),
                        elevation: 1,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        child: ListTile(
                          leading: const Icon(Icons.shopping_bag_outlined, color: Colors.blue),
                          title: Text(itemTitle, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          subtitle: Text(itemPrice, style: const TextStyle(color: Colors.green, fontWeight: FontWeight.w600)),
                          trailing: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.orange,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            ),
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('طلب شراء: $itemTitle 🛒')),
                              );
                            },
                            child: const Text('شراء', style: TextStyle(fontSize: 11)),
                          ),
                        ),
                      );
                    },
                  ),
          ],
        ),
      ),
    );
  }
}