import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/i18n.dart';
import '../core/languages.dart';
import '../core/locale.dart';

void showLanguagePicker(BuildContext context, [dynamic extra]) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    builder: (_) => const _LanguageSheet(),
  );
}

class _LanguageSheet extends ConsumerStatefulWidget {
  const _LanguageSheet();
  @override
  ConsumerState<_LanguageSheet> createState() => _LanguageSheetState();
}

class _LanguageSheetState extends ConsumerState<_LanguageSheet> {
  String _q = '';

  String _safeTranslate(BuildContext context, String key, String fallback) {
    try {
      final res = context.tr(key);
      return (res.isEmpty || res == key) ? fallback : res;
    } catch (_) {
      return fallback;
    }
  }

  // دالة ذكية لتوليد علم الدولة الحقيقي ديناميكياً بناءً على رمز اللغة
  String _getFlagForLanguage(String tag) {
    String lowerTag = tag.toLowerCase();

    if (lowerTag.contains('ar') || lowerTag.contains('ary')) return '🇸🇦'; // السعودية
    if (lowerTag.contains('en')) return '🇺🇸'; // أمريكا / بريطانيا
    if (lowerTag.contains('fr')) return '🇫🇷'; // فرنسا
    if (lowerTag.contains('es')) return '🇪🇸'; // إسبانيا
    if (lowerTag.contains('de')) return '🇩🇪'; // ألمانيا
    if (lowerTag.contains('it')) return '🇮🇹'; // إيطاليا
    if (lowerTag.contains('tr')) return '🇹🇷'; // تركيا
    if (lowerTag.contains('zh') || lowerTag.contains('hant')) return '🇨🇳'; // الصين
    if (lowerTag.contains('ja')) return '🇯🇵'; // اليابان
    if (lowerTag.contains('ru')) return '🇷🇺'; // روسيا
    if (lowerTag.contains('hi')) return '🇮🇳'; // الهند
    if (lowerTag.contains('ur')) return '🇵🇰'; // باكستان
    if (lowerTag.contains('fa')) return '🇮🇷'; // إيران
    if (lowerTag.contains('zgh')) return '🇲🇦'; // الأمازيغية (المغرب)
    if (lowerTag.contains('id') || lowerTag.contains('ms')) return '🇲🇾'; // ماليزيا
    if (lowerTag.contains('ko')) return '🇰🇷'; // كوريا الجنوبية
    if (lowerTag.contains('pt')) return '🇧🇷'; // البرازيل / البرتغال
    if (lowerTag.contains('nl')) return '🇳🇱'; // هولندا

    try {
      if (tag.contains('-') || tag.contains('_')) {
        final parts = tag.split(RegExp(r'[-_]')); // التصحيح هنا
        if (parts.length > 1 && parts[1].length == 2) {
          final countryCode = parts[1].toUpperCase();
          return countryCode.runes
              .map((rune) => String.fromCharCode(rune + 127397))
              .join();
        }
      }
      
      if (tag.length >= 2) {
        String baseCode = tag.substring(0, 2).toUpperCase();
        Map<String, String> codeToCountry = {
          'JA': 'JP', 'KO': 'KR', 'ZH': 'CN', 'EL': 'GR', 'HE': 'IL',
          'HI': 'IN', 'FA': 'IR', 'VI': 'VN', 'TH': 'TH', 'SV': 'SE',
          'DA': 'DK', 'FI': 'FI', 'NO': 'NO', 'PL': 'PL', 'CS': 'CZ',
          'HU': 'HU', 'RO': 'RO', 'UK': 'UA', 'BG': 'BG', 'HR': 'HR'
        };
        if (codeToCountry.containsKey(baseCode)) {
          baseCode = codeToCountry[baseCode]!;
        }
        return baseCode.runes
            .map((rune) => String.fromCharCode(rune + 127397))
            .join();
      }
    } catch (_) {}

    return '🌐';
  }

  @override
  Widget build(BuildContext context) {
    final current = ref.watch(localeProvider);
    final q = _q.trim().toLowerCase();
    
    final allLanguages = languageNames.entries.where((entry) {
      final tag = entry.key;
      final name = entry.value.toLowerCase();
      return q.isEmpty || name.contains(q) || tag.toLowerCase().contains(q);
    }).toList();
        
    return SizedBox(
      height: MediaQuery.of(context).size.height * .8,
      child: Column(children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: TextField(
            onChanged: (v) => setState(() => _q = v),
            decoration: InputDecoration(
              prefixIcon: const Icon(Icons.search), 
              hintText: _safeTranslate(context, 'search', 'Search languages / بحث...'),
              border: const OutlineInputBorder(),
            ),
          ),
        ),
        Expanded(
          child: ListView(children: [
            ListTile(
              leading: const Icon(Icons.phone_android, color: Colors.blue),
              title: Text(_safeTranslate(context, 'system_default', 'حسب نظام الهاتف (System Default)'), style: const TextStyle(fontWeight: FontWeight.bold)),
              trailing: current == null ? const Icon(Icons.check, color: Colors.blue) : null,
              onTap: () { 
                ref.read(localeProvider.notifier).choose(null); 
                Navigator.pop(context); 
              },
            ),
            const Divider(),
            for (final entry in allLanguages)
              () {
                final tag = entry.key;
                final name = entry.value;
                final locale = localeFromTag(tag);
                final flag = _getFlagForLanguage(tag);
                final isSelected = current != null && tagOf(current) == tag;

                return ListTile(
                  leading: Text(flag, style: const TextStyle(fontSize: 24)),
                  title: Text(name, style: const TextStyle(fontWeight: FontWeight.w500)),
                  subtitle: Text(tag, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                  trailing: isSelected ? const Icon(Icons.check, color: Colors.blue) : null,
                  onTap: () { 
                    ref.read(localeProvider.notifier).choose(locale); 
                    Navigator.pop(context); 
                  },
                );
              }(),
          ]),
        ),
      ]),
    );
  }
}