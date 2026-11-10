import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:typed_data';

import 'features/ads/ads_manager_page.dart';
import 'features/admin/admin_panel.dart';

void main() {
  runApp(
    const ProviderScope(
      child: VervifyxApp(),
    ),
  );
}

class VervifyxApp extends StatelessWidget {
  const VervifyxApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Vervifyx - شبكة التواصل الاجتماعي التجارية',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.blue,
          primary: Colors.blue,
          secondary: Colors.indigo,
        ),
        scaffoldBackgroundColor: const Color(0xFFF8F9FA),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.blue,
          foregroundColor: Colors.white,
          elevation: 0,
          centerTitle: true,
        ),
        fontFamily: 'Roboto',
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
  int _selectedIndex = 0;

  final List<Widget> _pages = const [
    SocialFeedScreen(),
    MyStoresScreen(),
    AdManagerPage(),
    ReelsScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _selectedIndex,
        children: _pages,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home, color: Colors.blue),
            label: 'الرئيسية',
          ),
          NavigationDestination(
            icon: Icon(Icons.storefront_outlined),
            selectedIcon: Icon(Icons.storefront, color: Colors.blue),
            label: 'المتاجر',
          ),
          NavigationDestination(
            icon: Icon(Icons.campaign_outlined),
            selectedIcon: Icon(Icons.campaign, color: Colors.blue),
            label: 'الإعلانات',
          ),
          NavigationDestination(
            icon: Icon(Icons.video_collection_outlined),
            selectedIcon: Icon(Icons.video_collection, color: Colors.blue),
            label: 'الريلز',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person, color: Colors.blue),
            label: 'حسابي',
          ),
        ],
      ),
    );
  }
}

// =========================================================================
// 1. الصفحة الرئيسية
// =========================================================================
class SocialFeedScreen extends StatefulWidget {
  const SocialFeedScreen({super.key});

  @override
  State<SocialFeedScreen> createState() => _SocialFeedScreenState();
}

class _SocialFeedScreenState extends State<SocialFeedScreen> {
  final feedPosts = [
    {
      'name': 'متجر درب إكسبريس (Derb Express)',
      'category': 'إلكترونيات وتقنية وأدوات رقمية',
      'time': 'منذ ساعتين',
      'content': 'مخططات هندسية متقدمة AutoCAD جاهزة للتحميل الفوري مع دعم فني كامل للمهندسين والمقاولين.',
      'image': 'https://picsum.photos/seed/store1/600/250',
      'likes': 24,
      'isLiked': false,
      'comments': 5,
    },
    {
      'name': 'عالم المعدات الكهربائية',
      'category': 'لوازم منزلية وصناعية',
      'time': 'منذ 5 ساعات',
      'content': 'توفرت من جديد تشكيلة واسعة من لوازم الإضاءة الذكية وحماية اللوحات الكهربائية بأفضل الأسعار جملة وتجزئة.',
      'image': 'https://picsum.photos/seed/store2/600/250',
      'likes': 41,
      'isLiked': false,
      'comments': 12,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Vervifyx Feed 🚀', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
        itemCount: feedPosts.length,
        itemBuilder: (context, index) {
          final item = feedPosts[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 8),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            elevation: 1,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ListTile(
                  dense: true,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 0),
                  leading: InkWell(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => StoreDashboardScreen(storeName: item['name'].toString()),
                        ),
                      );
                    },
                    child: const CircleAvatar(
                      radius: 18,
                      backgroundColor: Colors.blueAccent,
                      child: Icon(Icons.store, color: Colors.white, size: 18),
                    ),
                  ),
                  title: InkWell(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => StoreDashboardScreen(storeName: item['name'].toString()),
                        ),
                      );
                    },
                    child: Text(
                      item['name'].toString(),
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Colors.blue,
                        fontSize: 14,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ),
                  subtitle: Text(item['time'].toString(), style: const TextStyle(fontSize: 11)),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  child: Text(item['content'].toString(), style: const TextStyle(fontSize: 13)),
                ),
                Image.network(
                  item['image'].toString(),
                  height: 160,
                  width: double.infinity,
                  fit: BoxFit.cover,
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      TextButton.icon(
                        onPressed: () {
                          setState(() {
                            if (item['isLiked'] == true) {
                              item['isLiked'] = false;
                              item['likes'] = (item['likes'] as int) - 1;
                            } else {
                              item['isLiked'] = true;
                              item['likes'] = (item['likes'] as int) + 1;
                            }
                          });
                        },
                        icon: Icon(
                          (item['isLiked'] == true) ? Icons.thumb_up : Icons.thumb_up_outlined,
                          size: 16,
                          color: (item['isLiked'] == true) ? Colors.blue : Colors.grey,
                        ),
                        label: Text('${item['likes']} إعجاب', style: const TextStyle(fontSize: 12)),
                      ),
                      TextButton.icon(
                        onPressed: () {},
                        icon: const Icon(Icons.comment_outlined, size: 16),
                        label: Text('${item['comments']} تعليق', style: const TextStyle(fontSize: 12)),
                      ),
                      TextButton.icon(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('تم نسخ رابط المنشور بنجاح! 🔗'), duration: Duration(seconds: 1)),
                          );
                        },
                        icon: const Icon(Icons.share_outlined, size: 16),
                        label: const Text('مشاركة', style: TextStyle(fontSize: 12)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

// =========================================================================
// 2. شاشة إدارة المتاجر الخاصة بي
// =========================================================================
class MyStoresScreen extends StatefulWidget {
  const MyStoresScreen({super.key});

  @override
  State<MyStoresScreen> createState() => _MyStoresScreenState();
}

class _MyStoresScreenState extends State<MyStoresScreen> {
  final List myStores = [
    {
      'name': 'متجر درب إكسبريس (Derb Express)',
      'category': 'إلكترونيات وتقنية وأدوات رقمية',
      'status': 'نشط ومفعل ✅',
    },
    {
      'name': 'متجر المعدات الكهربائية الحديثة',
      'category': 'لوازم منزلية وصناعية',
      'status': 'قيد المراجعة 🔄',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('إدارة المتاجر الخاصة بي 🏪', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(8),
        itemCount: myStores.length,
        itemBuilder: (context, index) {
          final store = myStores[index];
          return Card(
            elevation: 1,
            margin: const EdgeInsets.only(bottom: 8),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            child: ListTile(
              dense: true,
              leading: const CircleAvatar(
                backgroundColor: Colors.blueAccent,
                child: Icon(Icons.store, color: Colors.white, size: 18),
              ),
              title: Text(store['name']!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              subtitle: Text('التصنيف: ${store['category']} | الحالة: ${store['status']}', style: const TextStyle(fontSize: 12)),
              trailing: const Icon(Icons.arrow_forward_ios, size: 14, color: Colors.blue),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => StoreDashboardScreen(storeName: store['name']!),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}

// =========================================================================
// 3. لوحة تحكم المتجر (إدارة المنتجات بالسعر الجديد والقديم + رفع الوسائط)
// =========================================================================
class StoreDashboardScreen extends StatefulWidget {
  final String storeName;
  const StoreDashboardScreen({super.key, required this.storeName});

  @override
  State<StoreDashboardScreen> createState() => _StoreDashboardScreenState();
}

class _StoreDashboardScreenState extends State<StoreDashboardScreen> {
  final List storeProducts = [
    {
      'name': 'مخطط هندسي AutoCAD - فئة A',
      'price': '250 درهم',
      'oldPrice': '350 درهم',
      'media': 'AutoCAD_Plan.jpg 🖼️',
      'stock': 'متاح 🟢'
    },
    {
      'name': 'لوحة توزيع كهربائية ذكية',
      'price': '1200 درهم',
      'oldPrice': '1500 درهم',
      'media': 'smart_board.mp4 🎥',
      'stock': 'متاح 🟢'
    },
  ];

  final List customerOrders = [
    {'client': 'محمد العلوي', 'product': 'مخطط هندسي AutoCAD', 'total': '250 درهم', 'status': 'قيد التوصيل 🚚'},
    {'client': 'يوسف بناني', 'product': 'لوحة توزيع كهربائية', 'total': '1200 درهم', 'status': 'مؤكد ✅'},
  ];

  void _openProductsManagement(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: Text('إدارة منتجات: ${widget.storeName} 📦', style: const TextStyle(fontSize: 16)),
          content: SizedBox(
            width: 550,
            height: 420,
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('المنتجات الحالية:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.blue, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(horizontal: 8)),
                        onPressed: () {
                          _openAddProductDialog(setDialogState);
                        },
                        icon: const Icon(Icons.add, size: 16),
                        label: const Text('إضافة منتج', style: TextStyle(fontSize: 12)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: storeProducts.length,
                    itemBuilder: (context, index) {
                      final prod = storeProducts[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 6),
                        child: ListTile(
                          dense: true,
                          title: Text(prod['name']!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text('السعر الحالي: ${prod['price']}', style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 11)),
                                  const SizedBox(width: 8),
                                  Text(
                                    'السعر القديم: ${prod['oldPrice']}',
                                    style: const TextStyle(color: Colors.grey, decoration: TextDecoration.lineThrough, fontSize: 11),
                                  ),
                                ],
                              ),
                              Text('الملف: ${prod['media']} | الحالة: ${prod['stock']}', style: const TextStyle(fontSize: 10, color: Colors.blueGrey)),
                            ],
                          ),
                          trailing: IconButton(
                            icon: const Icon(Icons.delete, color: Colors.red, size: 18),
                            onPressed: () {
                              setState(() {
                                storeProducts.removeAt(index);
                              });
                              setDialogState(() {});
                            },
                          ),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
          actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('إغلاق'))],
        ),
      ),
    );
  }

  void _openAddProductDialog(StateSetter parentSetState) {
    TextEditingController nameController = TextEditingController();
    TextEditingController priceController = TextEditingController();
    TextEditingController oldPriceController = TextEditingController();
    TextEditingController mediaController = TextEditingController(text: 'لم يتم اختيار ملف ❌');

    // استخدام image_picker العادية المتوافقة مع أندرويد وجميع المنصات
    Future<void> pickProductMedia(StateSetter setDialogState) async {
      try {
        final ImagePicker picker = ImagePicker();
        final XFile? image = await picker.pickImage(source: ImageSource.gallery);
        if (image != null) {
          setDialogState(() { 
            mediaController.text = image.name; 
          });
        }
      } catch (e) {
        setDialogState(() { 
          mediaController.text = 'vervifyx_product.jpg 🖼️'; 
        });
      }
    }

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('إضافة منتج جديد مع السعر والوسائط ➕', style: TextStyle(fontSize: 15)),
          content: SizedBox(
            width: 450,
            height: 380,
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('اسم المنتج:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                  const SizedBox(height: 4),
                  TextField(controller: nameController, decoration: const InputDecoration(border: OutlineInputBorder(), hintText: 'أدخل اسم المنتج', isDense: true)),
                  const SizedBox(height: 10),
                  
                  // السعر الحالي والسعر القديم
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('السعر الحالي (درهم):', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                            const SizedBox(height: 4),
                            TextField(controller: priceController, keyboardType: TextInputType.number, decoration: const InputDecoration(border: OutlineInputBorder(), hintText: '250', isDense: true)),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('السعر القديم (مشطوب):', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                            const SizedBox(height: 4),
                            TextField(controller: oldPriceController, keyboardType: TextInputType.number, decoration: const InputDecoration(border: OutlineInputBorder(), hintText: '350', isDense: true)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  // تحميل صورة أو فيديو المنتج من الجهاز
                  const Text('ملف المنتج (صورة / فيديو من الجهاز):', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.blue, foregroundColor: Colors.white),
                        onPressed: () => pickProductMedia(setDialogState),
                        child: const Text('اختر ملف', style: TextStyle(fontSize: 11)),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: TextField(controller: mediaController, readOnly: true, decoration: const InputDecoration(border: OutlineInputBorder(), isDense: true)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('إلغاء')),
            ElevatedButton(
              onPressed: () {
                if (nameController.text.isNotEmpty && priceController.text.isNotEmpty) {
                  setState(() {
                    storeProducts.add({
                      'name': nameController.text,
                      'price': '${priceController.text} درهم',
                      'oldPrice': oldPriceController.text.isNotEmpty ? '${oldPriceController.text} درهم' : 'غير متوفر',
                      'media': mediaController.text,
                      'stock': 'متاح 🟢',
                    });
                  });
                  parentSetState(() {});
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تمت إضافة المنتج بنجاح! 📦✅'), duration: Duration(seconds: 1)));
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('يرجى إدخال اسم المنتج والسعر الحالي! ⚠️'), duration: Duration(seconds: 1)));
                }
              },
              child: const Text('حفظ المنتج'),
            ),
          ],
        ),
      ),
    );
  }

  void _openCustomerOrders(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('طلبات العملاء 🛍️', style: TextStyle(fontSize: 16)),
        content: SizedBox(
          width: 500,
          height: 300,
          child: ListView.builder(
            itemCount: customerOrders.length,
            itemBuilder: (context, index) {
              final ord = customerOrders[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 6),
                child: ListTile(
                  dense: true,
                  title: Text('العميل: ${ord['client']}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  subtitle: Text('الطلب: ${ord['product']} | المبلغ: ${ord['total']} | الحالة: ${ord['status']}', style: const TextStyle(fontSize: 11)),
                ),
              );
            },
          ),
        ),
        actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('إغلاق'))],
      ),
    );
  }

  void _openStoreSettings(BuildContext context) {
    TextEditingController storeNameController = TextEditingController(text: widget.storeName);
    TextEditingController storeDescController = TextEditingController(text: 'متجرك الرقمي الأول للتقنية والحلول');

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('إعدادات المتجر ⚙️', style: TextStyle(fontSize: 16)),
        content: SizedBox(
          width: 500,
          height: 320,
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('اسم المتجر:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                const SizedBox(height: 4),
                TextField(controller: storeNameController, decoration: const InputDecoration(border: OutlineInputBorder(), isDense: true)),
                const SizedBox(height: 10),
                const Text('وصف المتجر:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                const SizedBox(height: 4),
                TextField(controller: storeDescController, maxLines: 2, decoration: const InputDecoration(border: OutlineInputBorder(), isDense: true)),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('إلغاء')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.blue, foregroundColor: Colors.white),
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم حفظ الإعدادات بنجاح! ✅'), duration: Duration(seconds: 1)));
            },
            child: const Text('حفظ'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('لوحة تحكم: ${widget.storeName}', style: const TextStyle(fontSize: 16))),
      body: Padding(
        padding: const EdgeInsets.all(12.0),
        child: ListView(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.blue.withOpacity(0.08),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(widget.storeName, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.blue)),
                  const SizedBox(height: 4),
                  const Text('حالة المتجر: نشط ومفعل مجاناً 🚀', style: TextStyle(fontSize: 12, color: Colors.black87)),
                ],
              ),
            ),
            const SizedBox(height: 12),
            Card(
              elevation: 1,
              child: Column(
                children: [
                  ListTile(
                    dense: true,
                    leading: const Icon(Icons.inventory_2, color: Colors.blue, size: 20),
                    title: const Text('إدارة منتجات المتجر 📦', style: TextStyle(fontSize: 13)),
                    trailing: const Icon(Icons.arrow_forward_ios, size: 14),
                    onTap: () => _openProductsManagement(context),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    dense: true,
                    leading: const Icon(Icons.shopping_cart, color: Colors.orange, size: 20),
                    title: const Text('طلبات العملاء 🛍️', style: TextStyle(fontSize: 13)),
                    trailing: const Icon(Icons.arrow_forward_ios, size: 14),
                    onTap: () => _openCustomerOrders(context),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    dense: true,
                    leading: const Icon(Icons.settings, color: Colors.grey, size: 20),
                    title: const Text('إعدادات المتجر ⚙️', style: TextStyle(fontSize: 13)),
                    trailing: const Icon(Icons.arrow_forward_ios, size: 14),
                    onTap: () => _openStoreSettings(context),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// =========================================================================
// 4. واجهة الريلز
// =========================================================================
class ReelsScreen extends StatelessWidget {
  const ReelsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(backgroundColor: Colors.black, title: const Text('الريلز التجارية 🎬')),
      body: Stack(
        children: [
          const Center(child: Text('فيديو الريلز المعروض حالياً 🎥', style: TextStyle(color: Colors.white70, fontSize: 16))),
          Positioned(
            bottom: 20,
            right: 20,
            left: 20,
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(backgroundColor: Colors.blue, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 10)),
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم إرسال الطلب بنجاح! 🚀✅'), duration: Duration(seconds: 1)));
              },
              icon: const Icon(Icons.shopping_bag_outlined, size: 18),
              label: const Text('طلب المنتج 🛍️', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }
}

// =========================================================================
// 5. واجهة الملف الشخصي
// =========================================================================
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('الملف الشخصي', style: TextStyle(fontWeight: FontWeight.bold))),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          children: [
            const CircleAvatar(
              radius: 40,
              backgroundColor: Colors.blueAccent,
              child: Icon(Icons.person, size: 40, color: Colors.white),
            ),
            const SizedBox(height: 8),
            const Text('Driss Elkarmam', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const Text('رائد أعمال ومؤسس منصة Vervifyx', style: TextStyle(fontSize: 12, color: Colors.grey)),
            const SizedBox(height: 12),
            Card(
              elevation: 1,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              child: Column(
                children: [
                  ListTile(
                    dense: true,
                    leading: const Icon(Icons.admin_panel_settings, color: Colors.indigo, size: 20),
                    title: const Text('لوحة تحكم الأدمين (Admin)', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                    trailing: const Icon(Icons.arrow_forward_ios, size: 14),
                    onTap: () {
                      Navigator.push(context, MaterialPageRoute(builder: (context) => const AdminPanelScreen()));
                    },
                  ),
                  const Divider(height: 1),
                  ListTile(
                    dense: true,
                    leading: const Icon(Icons.storefront, color: Colors.blue, size: 20),
                    title: const Text('إدارة المتاجر الخاصة بي', style: TextStyle(fontSize: 13)),
                    trailing: const Icon(Icons.arrow_forward_ios, size: 14),
                    onTap: () {
                      Navigator.push(context, MaterialPageRoute(builder: (context) => const MyStoresScreen()));
                    },
                  ),
                  const Divider(height: 1),
                  ListTile(
                    dense: true,
                    leading: const Icon(Icons.campaign, color: Colors.orange, size: 20),
                    title: const Text('سجل الحملات الإعلانية', style: TextStyle(fontSize: 13)),
                    trailing: const Icon(Icons.arrow_forward_ios, size: 14),
                    onTap: () {
                      Navigator.push(context, MaterialPageRoute(builder: (context) => const MyAdsHistoryScreen()));
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// =========================================================================
// 6. سجل الحملات الإعلانية
// =========================================================================
class MyAdsHistoryScreen extends StatefulWidget {
  const MyAdsHistoryScreen({super.key});

  @override
  State<MyAdsHistoryScreen> createState() => _MyAdsHistoryScreenState();
}

class _MyAdsHistoryScreenState extends State<MyAdsHistoryScreen> {
  final List myAds = [
    {
      'title': 'حملة مجانية بمناسبة الانطلاق',
      'type': 'ترويج شامل 🎁',
      'budget': 'مجاني 0.00',
      'target': 'جميع دول العالم (Worldwide) 🌍',
      'media': 'فيديو_ترحيب.mp4 📁',
      'status': 'نشط ومستمر 🚀',
    },
  ];

  void _showPhaseOneNotice() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('المرحلة الأولى - انطلاق مجاني! 🚀🎁', style: TextStyle(fontSize: 16)),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'أهلاً بك في Vervifyx!\n\nبمناسبة إطلاق المرحلة الأولى، جميع الخدمات وإنشاء المتاجر ونشر المنتجات مجانية 100% لخلق بيئة تجارية واسعة للجميع.',
              style: TextStyle(fontSize: 13, height: 1.4),
            ),
          ],
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.blue, foregroundColor: Colors.white),
            onPressed: () => Navigator.pop(context),
            child: const Text('موافق، ابدأ الآن!'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('سجل الحملات الإعلانية 📈', style: TextStyle(fontSize: 16)),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline, size: 26),
            onPressed: _showPhaseOneNotice,
            tooltip: 'إطلاق حملة جديدة',
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.green.withOpacity(0.12),
                border: Border.all(color: Colors.green),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Row(
                children: [
                  Icon(Icons.card_giftcard, color: Colors.green, size: 22),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'عرض الانطلاق: جميع خدمات المنصة والمتاجر والريلز مجانية بالكامل حالياً 100%! 🎉',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.green),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),
            Expanded(
              child: ListView.builder(
                itemCount: myAds.length,
                itemBuilder: (context, index) {
                  final ad = myAds[index];
                  return Card(
                    child: ListTile(
                      dense: true,
                      leading: const Icon(Icons.public, color: Colors.blue, size: 20),
                      title: Text(ad['title']!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                      subtitle: Text('النوع: ${ad['type']} | الاستهداف: ${ad['target']} | الميزانية: ${ad['budget']} | الحالة: ${ad['status']}', style: const TextStyle(fontSize: 11)),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}