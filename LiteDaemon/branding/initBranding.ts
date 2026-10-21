/**
 * LiteDaemon — Dynamic In-Memory Brand Initializer
 * Injects LiteDaemon branding into i18n at runtime.
 * Keeps upstream translation files completely untouched on disk,
 * guaranteeing 0 merge conflicts when pulling from upstream/main.
 */
import i18n from '../../src/i18n'

export function initLiteDaemonBranding() {
  const languages = ['en', 'zh', 'ja', 'ko', 'fr', 'de', 'es', 'pt', 'ru', 'it']

  // Override app name and maintain identical tagline across all supported languages
  languages.forEach((lang) => {
    i18n.addResourceBundle(
      lang,
      'translation',
      {
        app: {
          name: 'LiteDaemon',
          tagline: 'AI Voice Input',
        },
      },
      true,
      true
    )
  })

  // Home welcome title per language
  const welcomeTitles: Record<string, string> = {
    en: 'Welcome to LiteDaemon',
    zh: '欢迎使用 LiteDaemon',
    ja: 'LiteDaemon へようこそ',
    ko: 'LiteDaemon에 오신 것을 환영합니다',
    fr: 'Bienvenue sur LiteDaemon',
    de: 'Willkommen bei LiteDaemon',
    es: 'Bienvenido a LiteDaemon',
    pt: 'Bem-vindo ao LiteDaemon',
    ru: 'Добро пожаловать в LiteDaemon',
    it: 'Benvenuto in LiteDaemon',
  }

  Object.entries(welcomeTitles).forEach(([lang, title]) => {
    i18n.addResourceBundle(
      lang,
      'translation',
      {
        home: {
          welcome: title,
        },
      },
      true,
      true
    )
  })
}
