import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

const languageNames = <String, String>{
  'en': 'English', 'ar': 'العربية', 'ary': 'الدارجة المغربية', 'zgh': 'ⵜⴰⵎⴰⵣⵉⵖⵜ', 'fr': 'Français',
  'es': 'Español', 'pt': 'Português', 'pt-BR': 'Português (Brasil)', 'de': 'Deutsch', 'it': 'Italiano',
  'nl': 'Nederlands', 'ru': 'Русский', 'uk': 'Українська', 'be': 'Беларуская', 'pl': 'Polski',
  'cs': 'Čeština', 'sk': 'Slovenčina', 'sl': 'Slovenščina', 'hr': 'Hrvatski', 'sr': 'Српски',
  'bs': 'Bosanski', 'bg': 'Български', 'mk': 'Македонски', 'ro': 'Română', 'hu': 'Magyar',
  'el': 'Ελληνικά', 'tr': 'Türkçe', 'he': 'עברית', 'fa': 'فارسی', 'ur': 'اردو', 'ps': 'پښتو',
  'sd': 'سنڌي', 'ug': 'ئۇيغۇرچە', 'ku': 'Kurdî', 'ckb': 'کوردی', 'hi': 'हिन्दी', 'bn': 'বাংলা',
  'mr': 'मराठी', 'gu': 'ગુજરાતી', 'pa': 'ਪੰਜਾਬੀ', 'ta': 'தமிழ்', 'te': 'తెలుగు', 'kn': 'ಕನ್ನಡ',
  'ml': 'മലയാളം', 'or': 'ଓଡ଼ିଆ', 'as': 'অসমীয়া', 'ne': 'नेपाली', 'si': 'සිංහල', 'th': 'ไทย',
  'lo': 'ລາວ', 'km': 'ខ្មែរ', 'my': 'မြန်မာ', 'vi': 'Tiếng Việt', 'id': 'Bahasa Indonesia',
  'ms': 'Bahasa Melayu', 'fil': 'Filipino', 'ja': '日本語', 'ko': '한국어', 'zh-Hans': '简体中文',
  'zh-Hant': '繁體中文', 'mn': 'Монгол', 'kk': 'Қазақша', 'ky': 'Кыргызча', 'uz': 'Oʻzbekcha',
  'tg': 'Тоҷикӣ', 'tk': 'Türkmençe', 'az': 'Azərbaycanca', 'hy': 'Հայերեն', 'ka': 'ქართული',
  'sq': 'Shqip', 'lv': 'Latviešu', 'lt': 'Lietuvių', 'et': 'Eesti', 'fi': 'Suomi', 'sv': 'Svenska',
  'da': 'Dansk', 'nb': 'Norsk bokmål', 'is': 'Íslenska', 'ga': 'Gaeilge', 'cy': 'Cymraeg',
  'ca': 'Català', 'eu': 'Euskara', 'gl': 'Galego', 'mt': 'Malti', 'lb': 'Lëtzebuergesch',
  'af': 'Afrikaans', 'sw': 'Kiswahili', 'zu': 'isiZulu', 'am': 'አማርኛ', 'ti': 'ትግርኛ', 'so': 'Soomaali',
  'ha': 'Hausa', 'yo': 'Yorùbá', 'ig': 'Igbo', 'rw': 'Kinyarwanda', 'mg': 'Malagasy',
};

const rtlLanguages = {'ar', 'ary', 'fa', 'he', 'ur', 'ps', 'sd', 'ug', 'ckb', 'yi', 'dv'};

Locale localeFromTag(String tag) {
  final parts = tag.replaceAll('_', '-').split('-');
  String? script;
  String? country;
  for (final p in parts.skip(1)) {
    if (p.length == 4) { script = p; } else { country = p; }
  }
  return Locale.fromSubtags(languageCode: parts.first, scriptCode: script, countryCode: country);
}

String tagOf(Locale l) => [l.languageCode, if (l.scriptCode != null) l.scriptCode!, if (l.countryCode != null) l.countryCode!].join('-');

String languageName(Locale l) => languageNames[tagOf(l)] ?? languageNames[l.languageCode] ?? tagOf(l);

bool isRtl(Locale l) => rtlLanguages.contains(l.languageCode);

class AppLocales {
  static List<Locale> supported = [const Locale('en')];

  static Future<void> init() async {
    try {
      final manifest = await AssetManifest.loadFromAssetBundle(rootBundle);
      final tags = manifest
          .listAssets()
          .where((a) => a.startsWith('assets/i18n/') && a.endsWith('.json'))
          .map((a) => a.split('/').last.replaceAll('.json', ''))
          .toList()
        ..sort();
      if (tags.isNotEmpty) supported = tags.map(localeFromTag).toList();
    } catch (_) {}
  }
}