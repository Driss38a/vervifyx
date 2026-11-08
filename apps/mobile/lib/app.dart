import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/i18n.dart';
import 'core/languages.dart';
import 'core/locale.dart';
import 'core/router.dart';
import 'design/theme.dart';

class VervifyxApp extends ConsumerWidget {
  const VervifyxApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final locale = ref.watch(localeProvider);
    return MaterialApp.router(
      title: 'vervifyx',
      debugShowCheckedModeBanner: false,
      theme: buildTheme(Brightness.light),
      darkTheme: buildTheme(Brightness.dark),
      themeMode: ThemeMode.system,
      locale: locale,
      supportedLocales: AppLocales.supported,
      localizationsDelegates: const [
        AppStrings.delegate,
        SafeMaterial(GlobalMaterialLocalizations.delegate),
        GlobalWidgetsLocalizations.delegate,
        SafeCupertino(GlobalCupertinoLocalizations.delegate),
      ],
      builder: (context, child) {
        final active = Localizations.maybeLocaleOf(context) ?? locale ?? WidgetsBinding.instance.platformDispatcher.locale;
        return Directionality(
          textDirection: isRtl(active) ? TextDirection.rtl : TextDirection.ltr,
          child: child ?? const SizedBox.shrink(),
        );
      },
      routerConfig: ref.watch(routerProvider),
    );
  }
}