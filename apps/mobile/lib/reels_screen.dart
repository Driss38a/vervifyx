import 'package:flutter/material.dart';

class ReelsScreen extends StatefulWidget {
  const ReelsScreen({super.key});

  @override
  State<ReelsScreen> createState() => _ReelsScreenState();
}

class _ReelsScreenState extends State<ReelsScreen> {
  final List reelsList = [
    {
      'title': 'مخطط هندسي متقدم AutoCAD',
      'price': '150 درهم',
      'image': 'https://picsum.photos/seed/reel1/400/800',
    }
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: PageView.builder(
        itemCount: reelsList.length,
        itemBuilder: (context, index) {
          final reel = reelsList[index];
          return Stack(
            children: [
              Positioned.fill(
                child: Image.network(
                  reel['image'],
                  fit: BoxFit.cover,
                ),
              ),
              Positioned(
                bottom: 110,
                left: 16,
                right: 16,
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.9),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            reel['title'],
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          Text(
                            reel['price'],
                            style: const TextStyle(color: Colors.blue),
                          ),
                        ],
                      ),
                      ElevatedButton(
                        onPressed: () {
                          _showCheckoutForm(context, reel['title'], reel['price']);
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          foregroundColor: Colors.white,
                        ),
                        child: const Text('اطلب الآن'),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  // نافذة إدخال المعلومات (الاسم، الهاتف، العنوان)
  void _showCheckoutForm(BuildContext context, String title, String price) {
    final nameController = TextEditingController();
    final phoneController = TextEditingController();
    final addressController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          title: Text('إتمام طلب: $title'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('السعر الإجمالي: $price', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.blue)),
                const SizedBox(height: 16),
                TextField(
                  controller: nameController,
                  decoration: const InputDecoration(
                    labelText: 'الاسم الكامل',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.person),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: phoneController,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(
                    labelText: 'رقم الهاتف',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.phone),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: addressController,
                  decoration: const InputDecoration(
                    labelText: 'العنوان أو المدينة',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.location_on),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('إلغاء'),
            ),
            ElevatedButton(
              onPressed: () {
                // التحقق البسيط أن المعلومات مدخلة
                if (nameController.text.isEmpty || phoneController.text.isEmpty || addressController.text.isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('المرجو تعبئة جميع المعلومات! ⚠️', style: TextStyle(color: Colors.white)), backgroundColor: Colors.red),
                  );
                  return;
                }

                Navigator.of(ctx).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('مرحباً ${nameController.text}، تم تأكيد طلبك بنجاح! 🚀')),
                );
              },
              style: ElevatedButton.styleFrom(backgroundColor: Colors.green, foregroundColor: Colors.white),
              child: const Text('تأكيد الطلب'),
            ),
          ],
        );
      },
    );
  }
}