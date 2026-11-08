import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:typed_data';
import 'package:image_picker_web/image_picker_web.dart';

class StoresPage extends ConsumerStatefulWidget {
  const StoresPage({super.key});

  @override
  ConsumerState<StoresPage> createState() => _StoresPageState();
}

class _StoresPageState extends ConsumerState<StoresPage> {
  var userStores = [
    {
      'name': 'متجر درب إكسبريس (Derb Express)',
      'category': 'إلكترونيات وتقنية وأدوات رقمية',
      'description': 'متجرك الرقمي الأول للتقنية والحلول، نقدم لك أحدث المخططات والمنتجات التقنية.',
      'products': [
        {
          'title': 'مخطط هندسي متقدم AutoCAD',
          'price': '150 درهم',
          'image': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300'
        },
      ]
    },
    {
      'name': 'عالم المعدات الكهربائية',
      'category': 'لوازم منزلية وصناعية',
      'description': 'متاجر متخصصة في التجهيزات والتركيبات الكهربائية وأنظمة الإضاءة الحديثة.',
      'products': [
        {
          'title': 'مسار إضاءة مغناطيسي (Magnetic Track)',
          'price': '450 درهم',
          'image': 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=300'
        },
      ]
    },
  ];

  void _openStoreFullPage(Map store) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => StoreDetailsFullScreen(
          storeData: store,
          onProductAdded: (newProduct) {
            setState(() {
              (store['products'] as List).add(newProduct);
            });
          },
        ),
      ),
    );
  }

  void _openAddStorePage() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => AddStoreScreen(
          onStoreCreated: (newStore) {
            setState(() {
              userStores.add(newStore);
            });
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('تم إنشاء المتجر بنجاح! 🚀')),
            );
          },
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('دليل المتاجر - Vervifyx', style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
      ),
      body: userStores.isEmpty
          ? const Center(
              child: Text(
                'ليس لديك أي متاجر حالياً.',
                style: TextStyle(fontSize: 16, color: Colors.grey),
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: userStores.length,
              itemBuilder: (context, index) {
                final store = userStores[index];
                final products = store['products'] as List;

                return Card(
                  elevation: 3,
                  margin: const EdgeInsets.only(bottom: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(16),
                    onTap: () => _openStoreFullPage(store),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              CircleAvatar(
                                radius: 26,
                                backgroundColor: theme.colorScheme.primary.withOpacity(0.1),
                                child: Icon(Icons.storefront_rounded, size: 28, color: theme.colorScheme.primary),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Text(
                                          store['name'].toString(),
                                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                        ),
                                        const Spacer(),
                                        const Icon(Icons.arrow_forward_ios, size: 14, color: Colors.blue),
                                      ],
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      store['category'].toString(),
                                      style: TextStyle(color: Colors.grey[600], fontSize: 13),
                                    ),
                                  ],
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
                                onPressed: () {
                                  setState(() {
                                    userStores.removeAt(index);
                                  });
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('تم حذف المتجر')),
                                  );
                                },
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(store['description'].toString(), style: const TextStyle(fontSize: 14, color: Colors.black87)),
                          const SizedBox(height: 12),
                          const Divider(),
                          Text('منتجات المتجر (${products.length}):', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.grey)),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openAddStorePage,
        icon: const Icon(Icons.add_business),
        label: const Text('إنشاء متجر جديد'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
      ),
    );
  }
}

// =========================================================================
// صفحة تفاصيل المتجر الكاملة
// =========================================================================
class StoreDetailsFullScreen extends StatefulWidget {
  final Map storeData;
  final Function(Map) onProductAdded;

  const StoreDetailsFullScreen({super.key, required this.storeData, required this.onProductAdded});

  @override
  State<StoreDetailsFullScreen> createState() => _StoreDetailsFullScreenState();
}

class _StoreDetailsFullScreenState extends State<StoreDetailsFullScreen> {
  Uint8List? _pickedImageBytes;
  String? _pickedImageName;

  void _openAddProductDialog() {
    final titleController = TextEditingController();
    final priceController = TextEditingController();
    _pickedImageBytes = null;
    _pickedImageName = null;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('إضافة منتج وتحميل صورته من الجهاز 📦', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: titleController,
                  decoration: const InputDecoration(labelText: 'اسم المنتج', border: OutlineInputBorder()),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: priceController,
                  decoration: const InputDecoration(labelText: 'السعر (مثال: 150 درهم)', border: OutlineInputBorder()),
                ),
                const SizedBox(height: 16),
                OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    side: const BorderSide(color: Colors.blue),
                  ),
                  onPressed: () async {
                    Uint8List? bytes = await ImagePickerWeb.getImageAsBytes();
                    if (bytes != null) {
                      setDialogState(() {
                        _pickedImageBytes = bytes;
                        _pickedImageName = 'صورة_مختارة_${DateTime.now().millisecondsSinceEpoch}.png';
                      });
                    }
                  },
                  icon: const Icon(Icons.upload_file, color: Colors.blue),
                  label: Text(_pickedImageName ?? 'تحميل صورة من الجهاز 🖼️', style: const TextStyle(color: Colors.blue)),
                ),
                if (_pickedImageBytes != null) ...[
                  const SizedBox(height: 10),
                  const Text('تم تحميل الصورة بنجاح! ✅', style: TextStyle(color: Colors.green, fontSize: 12, fontWeight: FontWeight.bold)),
                ]
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('إلغاء', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: Colors.blue, foregroundColor: Colors.white),
              onPressed: () {
                if (titleController.text.isNotEmpty) {
                  final newProduct = {
                    'title': titleController.text,
                    'price': priceController.text.isNotEmpty ? priceController.text : 'غير محدد',
                    'imageBytes': _pickedImageBytes,
                    'image': 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300',
                  };
                  widget.onProductAdded(newProduct);
                  setState(() {});
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('تمت إضافة المنتج بنجاح! ✅')),
                  );
                }
              },
              child: const Text('إضافة'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final store = widget.storeData;
    final products = store['products'] is List ? store['products'] as List : [];

    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(store['name'].toString(), style: const TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 900),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [BoxShadow(color: Colors.grey.withOpacity(0.1), blurRadius: 6)],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const CircleAvatar(radius: 30, backgroundColor: Colors.blue, child: Icon(Icons.storefront, size: 32, color: Colors.white)),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(store['name'].toString(), style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                                const SizedBox(height: 4),
                                Text(store['category'].toString(), style: const TextStyle(color: Colors.blue, fontWeight: FontWeight.w600)),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Text(store['description'].toString(), style: const TextStyle(fontSize: 15, color: Colors.black87, height: 1.4)),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                const Text('الستوريات وعروض الفيديو 🎬', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 12),
                SizedBox(
                  height: 85,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: const [
                      StoryWidget(title: 'معاينة حية', icon: '🎥'),
                      StoryWidget(title: 'عروض اليوم', icon: '🔥'),
                      StoryWidget(title: 'طريقة العمل', icon: '⚡'),
                      StoryWidget(title: 'آراء الزبناء', icon: '⭐'),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('معرض المنتجات 🛍️', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.green, foregroundColor: Colors.white),
                      onPressed: _openAddProductDialog,
                      icon: const Icon(Icons.add, size: 16),
                      label: const Text('إضافة منتج جديد'),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                products.isEmpty
                    ? const Padding(
                        padding: EdgeInsets.all(40.0),
                        child: Center(child: Text('لا توجد منتجات مضافة في هذا المتجر حالياً.', style: TextStyle(color: Colors.grey))),
                      )
                    : ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: products.length,
                        itemBuilder: (context, index) {
                          final item = products[index] as Map;
                          final Uint8List? imgBytes = item['imageBytes'] as Uint8List?;

                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            elevation: 2,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            child: ListTile(
                              contentPadding: const EdgeInsets.all(12),
                              leading: ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: imgBytes != null
                                    ? Image.memory(imgBytes, width: 60, height: 60, fit: BoxFit.cover)
                                    : Image.network(
                                        item['image'].toString(),
                                        width: 60,
                                        height: 60,
                                        fit: BoxFit.cover,
                                        errorBuilder: (context, error, stackTrace) => Container(
                                          width: 60,
                                          height: 60,
                                          color: Colors.grey[200],
                                          child: const Icon(Icons.image_not_supported, color: Colors.grey),
                                        ),
                                      ),
                              ),
                              title: Text(
                                item['title'].toString(),
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                              ),
                              subtitle: Padding(
                                padding: const EdgeInsets.only(top: 4),
                                child: Text(
                                  item['price'].toString(),
                                  style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 14),
                                ),
                              ),
                              // زر "طلب الآن" الذي يفتح نافذة تأكيد الطلب وإدخال المعلومات
                              trailing: ElevatedButton(
                                style: ElevatedButton.styleFrom(backgroundColor: Colors.blue, foregroundColor: Colors.white),
                                onPressed: () {
                                  showDialog(
                                    context: context,
                                    builder: (BuildContext ctx) {
                                      return AlertDialog(
                                        title: const Text('تأكيد الطلب المباشر 🛒'),
                                        content: Text('هل تريد تأكيد طلب المنتج: "${item['title']}" بسعر ${item['price']}؟'),
                                        actions: [
                                          TextButton(
                                            onPressed: () => Navigator.of(ctx).pop(),
                                            child: const Text('إلغاء'),
                                          ),
                                          ElevatedButton(
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor: Colors.green,
                                              foregroundColor: Colors.white,
                                            ),
                                            onPressed: () {
                                              Navigator.of(ctx).pop(); // إغلاق النافذة الأولى

                                              // فتح نافذة إدخال بيانات التوصيل للزبون
                                              showDialog(
                                                context: context,
                                                builder: (BuildContext contextData) {
                                                  final nameController = TextEditingController();
                                                  final phoneController = TextEditingController();
                                                  final addressController = TextEditingController();

                                                  return AlertDialog(
                                                    title: const Text('أدخل معلومات الشحن والتوصيل 📦'),
                                                    content: SingleChildScrollView(
                                                      child: Column(
                                                        mainAxisSize: MainAxisSize.min,
                                                        children: [
                                                          TextField(
                                                            controller: nameController,
                                                            decoration: const InputDecoration(labelText: 'الاسم الكامل', border: OutlineInputBorder()),
                                                          ),
                                                          const SizedBox(height: 12),
                                                          TextField(
                                                            controller: phoneController,
                                                            keyboardType: TextInputType.phone,
                                                            decoration: const InputDecoration(labelText: 'رقم الهاتف (واتساب)', border: OutlineInputBorder()),
                                                          ),
                                                          const SizedBox(height: 12),
                                                          TextField(
                                                            controller: addressController,
                                                            decoration: const InputDecoration(labelText: 'العنوان أو المدینة', border: OutlineInputBorder()),
                                                          ),
                                                        ],
                                                      ),
                                                    ),
                                                    actions: [
                                                      TextButton(
                                                        onPressed: () => Navigator.pop(contextData),
                                                        child: const Text('إلغاء'),
                                                      ),
                                                      ElevatedButton(
                                                        style: ElevatedButton.styleFrom(backgroundColor: Colors.green, foregroundColor: Colors.white),
                                                        onPressed: () {
                                                          Navigator.pop(contextData);
                                                          showDialog(
                                                            context: context,
                                                            builder: (context) => AlertDialog(
                                                              title: const Text('تم استلام طلبك بنجاح! 🎉'),
                                                              content: Text('شكرا لك يا ${nameController.text}. سيتم التواصل معك عبر رقم الواتساب: ${phoneController.text} لتأكيد إرسال منتج "${item['title']}".'),
                                                              actions: [
                                                                ElevatedButton(
                                                                  onPressed: () => Navigator.pop(context),
                                                                  child: const Text('موافق'),
                                                                ),
                                                              ],
                                                            ),
                                                          );
                                                        },
                                                        child: const Text('إرسال الطلب الآن'),
                                                      ),
                                                    ],
                                                  );
                                                },
                                              );
                                            },
                                            child: const Text('تأكيد الطلب'),
                                          ),
                                        ],
                                      );
                                    },
                                  );
                                },
                                child: const Text('طلب الآن'),
                              ),
                            ),
                          );
                        },
                      ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class StoryWidget extends StatelessWidget {
  final String title;
  final String icon;

  const StoryWidget({super.key, required this.title, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(right: 12),
      child: Column(
        children: [
          CircleAvatar(
            radius: 26,
            backgroundColor: Colors.orange.withOpacity(0.2),
            child: Text(icon, style: const TextStyle(fontSize: 22)),
          ),
          const SizedBox(height: 4),
          Text(title, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}

class AddStoreScreen extends StatefulWidget {
  final Function(dynamic) onStoreCreated;

  const AddStoreScreen({super.key, required this.onStoreCreated});

  @override
  State<AddStoreScreen> createState() => _AddStoreScreenState();
}

class _AddStoreScreenState extends State<AddStoreScreen> {
  final TextEditingController storeNameController = TextEditingController();
  final TextEditingController storeDescController = TextEditingController();

  final platformCategories = [
    'إلكترونيات وتقنية وأدوات رقمية',
    'لوازم منزلية وصناعية',
    'كتب، مخططات ومؤلفات تقنية',
    'خدمات واستشارات هندسية',
  ];

  late String selectedCategory;

  @override
  void initState() {
    super.initState();
    selectedCategory = platformCategories[0];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('إنشاء متجر جديد 🛒', style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TextField(
              controller: storeNameController,
              decoration: const InputDecoration(labelText: 'اسم المتجر', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField(
              value: selectedCategory,
              isExpanded: true,
              items: platformCategories.map((cat) => DropdownMenuItem(value: cat, child: Text(cat))).toList(),
              onChanged: (val) => setState(() => selectedCategory = val.toString()),
              decoration: const InputDecoration(border: OutlineInputBorder()),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: storeDescController,
              maxLines: 3,
              decoration: const InputDecoration(labelText: 'وصف قصير للمتجر', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 30),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: Colors.blue, foregroundColor: Colors.white),
                onPressed: () {
                  if (storeNameController.text.isNotEmpty) {
                    widget.onStoreCreated({
                      'name': storeNameController.text,
                      'category': selectedCategory,
                      'description': storeDescController.text,
                      'products': [
                        {
                          'title': 'مخطط هندسي تجريبي أولي',
                          'price': '100 درهم',
                          'image': 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=300'
                        }
                      ]
                    });
                    Navigator.pop(context);
                  }
                },
                child: const Text('حفظ المتجر', style: TextStyle(fontSize: 16)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}