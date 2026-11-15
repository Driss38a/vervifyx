import 'package:flutter/material.dart';

class ReelsScreen extends StatefulWidget {
  const ReelsScreen({super.key});

  @override
  State<ReelsScreen> createState() => _ReelsScreenState();
}

class _ReelsScreenState extends State<ReelsScreen> {
  // تحديد نوع البيانات بوضوح لتجنب أخطاء Object
  final List reelsList = [
    {
      'title': 'مخطط هندسي متقدم AutoCAD',
      'price': '150 درهم',
      'icon': Icons.architecture,
      'likes': 120,
      'isLiked': false,
    },
    {
      'title': 'مسارات الإضاءة المغناطيسية الحديثة',
      'price': '320 درهم',
      'icon': Icons.lightbulb,
      'likes': 85,
      'isLiked': false,
    },
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
              // خلفية متدرجة وآمنة 100%
              Positioned.fill(
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.blue[900]!,
                        Colors.black87,
                        Colors.black,
                      ],
                    ),
                  ),
                  child: Center(
                    child: Icon(
                      reel['icon'] as IconData,
                      size: 100,
                      color: Colors.white.withOpacity(0.2),
                    ),
                  ),
                ),
              ),
              
              // تدرج لوني خفيف للأسفل
              Positioned.fill(
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [Colors.transparent, Colors.black.withOpacity(0.7)],
                    ),
                  ),
                ),
              ),

              // الأزرار التفاعلية على الجانب الأيمن
              Positioned(
                right: 16,
                bottom: 140,
                child: Column(
                  children: [
                    IconButton(
                      icon: Icon(
                        (reel['isLiked'] as bool) ? Icons.favorite : Icons.favorite_border,
                        color: (reel['isLiked'] as bool) ? Colors.red : Colors.white,
                        size: 32,
                      ),
                      onPressed: () {
                        setState(() {
                          bool currentLiked = reel['isLiked'] as bool;
                          reel['isLiked'] = !currentLiked;
                          reel['likes'] = (reel['likes'] as int) + (!currentLiked ? 1 : -1);
                        });
                      },
                    ),
                    Text('${reel['likes']}', style: const TextStyle(color: Colors.white, fontSize: 12)),
                    const SizedBox(height: 16),
                    const IconButton(
                      icon: Icon(Icons.comment, color: Colors.white, size: 30),
                      onPressed: null,
                    ),
                    const Text('14', style: TextStyle(color: Colors.white, fontSize: 12)),
                    const SizedBox(height: 16),
                    IconButton(
                      icon: const Icon(Icons.share, color: Colors.white, size: 30),
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('تم نسخ رابط الريلز بنجاح! 🔗')),
                        );
                      },
                    ),
                  ],
                ),
              ),

              // بطاقة المعلومات والسعر في الأسفل
              Positioned(
                bottom: 20,
                left: 16,
                right: 70,
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.95),
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 8),
                    ],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              reel['title'] as String,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              reel['price'] as String,
                              style: const TextStyle(color: Colors.blue, fontWeight: FontWeight.bold, fontSize: 13),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton(
                        onPressed: () {
                          _showCheckoutForm(context, reel['title'] as String, reel['price'] as String);
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        ),
                        child: const Text('اطلب الآن', style: TextStyle(fontSize: 12)),
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

  // نافذة إتمام الطلب
  void _showCheckoutForm(BuildContext context, String title, String price) {
    final nameController = TextEditingController();
    final phoneController = TextEditingController();
    final addressController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          title: Text('إتمام طلب: $title', style: const TextStyle(fontSize: 16)),
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