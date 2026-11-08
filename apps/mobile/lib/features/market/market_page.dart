import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'product_details_page.dart';
import 'stores_page.dart';

class MarketPage extends ConsumerStatefulWidget {
  const MarketPage({super.key});

  @override
  ConsumerState<MarketPage> createState() => _MarketPageState();
}

class _MarketPageState extends ConsumerState<MarketPage> {
  String selectedCategory = 'الكل';

  // تم إزالة أي أقواس زاوية نهائياً لتفادي مشاكل النسخ واللصق
  final allProducts = [
    {
      'title': 'منتج تقني مميز 1',
      'price': '299 د.م.',
      'category': 'إلكترونيات',
      'type': 'PHYSICAL',
      'icon': Icons.devices_rounded,
    },
    {
      'title': 'خدمة برمجة وأتمتة',
      'price': '500 د.م.',
      'category': 'خدمات',
      'type': 'SERVICE',
      'icon': Icons.code_rounded,
    },
    {
      'title': 'أداة ذكاء اصطناعي',
      'price': '150 د.م.',
      'category': 'اشتراكات',
      'type': 'SUBSCRIPTION',
      'icon': Icons.smart_toy_rounded,
    },
    {
      'title': 'معدة كهربائية حديثة',
      'price': '850 د.م.',
      'category': 'معدات',
      'type': 'PHYSICAL',
      'icon': Icons.electrical_services_rounded,
    },
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    final filteredProducts = selectedCategory == 'الكل'
        ? allProducts
        : allProducts.where((p) => p['category'] == selectedCategory).toList();

    const categories = ['الكل', 'إلكترونيات', 'خدمات', 'معدات', 'اشتراكات'];

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'السوق',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.storefront_rounded),
            tooltip: 'المتاجر المعتمدة',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const StoresPage(),
                ),
              );
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  TextField(
                    decoration: InputDecoration(
                      hintText: 'ابحث عن منتج أو خدمة...',
                      prefixIcon: const Icon(Icons.search_rounded),
                      filled: true,
                      fillColor: theme.colorScheme.surfaceContainerHighest.withOpacity(0.5),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: categories.map((cat) {
                        final isSelected = selectedCategory == cat;
                        return Padding(
                          padding: const EdgeInsets.only(left: 8.0),
                          child: FilterChip(
                            selected: isSelected,
                            label: Text(cat),
                            onSelected: (val) {
                              setState(() {
                                selectedCategory = cat;
                              });
                            },
                            selectedColor: theme.colorScheme.primaryContainer,
                            checkmarkColor: theme.colorScheme.primary,
                            labelStyle: TextStyle(
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                              color: isSelected ? theme.colorScheme.primary : theme.colorScheme.onSurface,
                            ),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ],
              ),
            ),
          ),
          filteredProducts.isEmpty
              ? SliverFillRemaining(
                  child: Center(
                    child: Text(
                      'لا توجد منتجات في هذا التصنيف حالياً',
                      style: theme.textTheme.bodyLarge?.copyWith(color: Colors.grey),
                    ),
                  ),
                )
              : SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  sliver: SliverGrid(
                    gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                      maxCrossAxisExtent: 280,
                      mainAxisSpacing: 16,
                      crossAxisSpacing: 16,
                      childAspectRatio: 0.78,
                    ),
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final product = filteredProducts[index];
                        return _buildProductCard(context, product, theme);
                      },
                      childCount: filteredProducts.length,
                    ),
                  ),
                ),
          const SliverToBoxAdapter(child: SizedBox(height: 24)),
        ],
      ),
    );
  }

  Widget _buildProductCard(
    BuildContext context,
    Map<String, dynamic> product,
    ThemeData theme,
  ) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: theme.colorScheme.outline.withOpacity(0.2),
        ),
      ),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => ProductDetailsPage(product: product),
            ),
          );
        },
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Stack(
                children: [
                  Container(
                    width: double.infinity,
                    color: theme.colorScheme.primary.withOpacity(0.08),
                    child: Icon(
                      product['icon'] as IconData,
                      size: 48,
                      color: theme.colorScheme.primary,
                    ),
                  ),
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.surface.withOpacity(0.8),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        product['type'].toString(),
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: theme.colorScheme.primary),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product['category'].toString(),
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: theme.colorScheme.primary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    product['title'].toString(),
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        product['price'].toString(),
                        style: theme.textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: theme.colorScheme.secondary,
                        ),
                      ),
                      IconButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => ProductDetailsPage(product: product),
                            ),
                          );
                        },
                        style: IconButton.styleFrom(
                          backgroundColor: theme.colorScheme.primaryContainer.withOpacity(0.4),
                          visualDensity: VisualDensity.compact,
                        ),
                        icon: Icon(
                          Icons.add_shopping_cart_rounded,
                          size: 20,
                          color: theme.colorScheme.primary,
                        ),
                      ),
                    ],
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