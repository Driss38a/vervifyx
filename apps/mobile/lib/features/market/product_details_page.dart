import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ProductDetailsPage extends ConsumerStatefulWidget {
  final Map<String, dynamic> product;

  const ProductDetailsPage({super.key, required this.product});

  @override
  ConsumerState<ProductDetailsPage> createState() => _ProductDetailsPageState();
}

class _ProductDetailsPageState extends ConsumerState<ProductDetailsPage> {
  int quantity = 1;
  final _formKey = GlobalKey<FormState>();
  
  final TextEditingController nameController = TextEditingController();
  final TextEditingController phoneController = TextEditingController();
  final TextEditingController addressController = TextEditingController();
  final TextEditingController cityController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final product = widget.product;

    return Scaffold(
      appBar: AppBar(
        title: Text(product['title'].toString()),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // صورة أو أيقونة المنتج البارزة
            Container(
              height: 250,
              width: double.infinity,
              color: theme.colorScheme.primary.withOpacity(0.08),
              child: Icon(
                product['icon'] as IconData ?? Icons.image_rounded,
                size: 80,
                color: theme.colorScheme.primary,
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // شارة التصنيف والنوع
                  Row(
                    children: [
                      Chip(
                        label: Text(product['category'].toString()),
                        visualDensity: VisualDensity.compact,
                      ),
                      const SizedBox(width: 8),
                      Chip(
                        label: Text(product['type'].toString()),
                        backgroundColor: theme.colorScheme.primaryContainer,
                        labelStyle: TextStyle(color: theme.colorScheme.primary, fontWeight: FontWeight.bold),
                        visualDensity: VisualDensity.compact,
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    product['title'].toString(),
                    style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    product['price'].toString(),
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: theme.colorScheme.secondary,
                    ),
                  ),
                  const Divider(height: 32),
                  
                  // وصف المنتج
                  Text(
                    'وصف المنتج',
                    style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'هذا المنتج يتميز بجودة عالية ومتانة كبيرة لتلبية كافة احتياجاتك اليومية. مصمم وفق أحدث المعايير لضمان أفضل تجربة استخدام.',
                    style: TextStyle(color: Colors.grey, height: 1.5),
                  ),
                  const Divider(height: 32),

                  // نموذج الطلب السريع (الدفع عند الاستلام)
                  Text(
                    'طلب سريع (الدفع عند الاستلام)',
                    style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),

                  Form(
                    key: _formKey,
                    child: Column(
                      children: [
                        TextFormField(
                          controller: nameController,
                          decoration: const InputDecoration(
                            labelText: 'الاسم الكامل',
                            border: OutlineInputBorder(),
                            prefixIcon: Icon(Icons.person_rounded),
                          ),
                          validator: (value) => value!.isEmpty ? 'يرجى إدخال الاسم' : null,
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: phoneController,
                          keyboardType: TextInputType.phone,
                          decoration: const InputDecoration(
                            labelText: 'رقم الهاتف',
                            border: OutlineInputBorder(),
                            prefixIcon: Icon(Icons.phone_rounded),
                          ),
                          validator: (value) => value!.isEmpty ? 'يرجى إدخال رقم الهاتف' : null,
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              flex: 2,
                              child: TextFormField(
                                controller: cityController,
                                decoration: const InputDecoration(
                                  labelText: 'المدينة',
                                  border: OutlineInputBorder(),
                                  prefixIcon: Icon(Icons.location_city_rounded),
                                ),
                                validator: (value) => value!.isEmpty ? 'أدخل المدينة' : null,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              flex: 1,
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  IconButton(
                                    onPressed: () => setState(() => quantity = quantity > 1 ? quantity - 1 : 1),
                                    icon: const Icon(Icons.remove_circle_outline),
                                  ),
                                  Text('$quantity', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                  IconButton(
                                    onPressed: () => setState(() => quantity++),
                                    icon: const Icon(Icons.add_circle_outline),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: addressController,
                          maxLines: 2,
                          decoration: const InputDecoration(
                            labelText: 'العنوان التفصيلي',
                            border: OutlineInputBorder(),
                            prefixIcon: Icon(Icons.home_rounded),
                          ),
                          validator: (value) => value!.isEmpty ? 'يرجى إدخال العنوان' : null,
                        ),
                        const SizedBox(height: 24),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: theme.colorScheme.primary,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            onPressed: () {
                              if (_formKey.currentState!.validate()) {
                                // إرسال الطلب بنجاح
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('تم إرسال طلبك بنجاح! سيتم الاتصال بك لتأكيد الطلب.')),
                                );
                              }
                            },
                            icon: const Icon(Icons.check_circle_rounded),
                            label: const Text('تأكيد الطلب الآن', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                          ),
                        ),
                      ],
                    ),
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