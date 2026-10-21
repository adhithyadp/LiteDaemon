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

  // Settings privacy notice under API Keys per language
  const storedLocallyTexts: Record<string, string> = {
    en: 'Stored locally on your device. Never sent to LiteDaemon servers.',
    zh: '存储在本地设备上。绝不会发送到 LiteDaemon 服务器。',
    ja: 'お使いのデバイスにローカル保存されます。LiteDaemonサーバーには送信されません。',
    ko: '기기에 로컬로 저장됩니다. LiteDaemon 서버로 전송되지 않습니다.',
    fr: 'Stockée localement sur votre appareil. Jamais envoyée aux serveurs LiteDaemon.',
    de: 'Lokal auf Ihrem Gerät gespeichert. Wird niemals an LiteDaemon-Server gesendet.',
    es: 'Almacenada localmente en tu dispositivo. Nunca se envía a los servidores de LiteDaemon.',
    pt: 'Armazenada localmente no seu dispositivo. Nunca enviada aos servidores do LiteDaemon.',
    ru: 'Хранится локально на вашем устройстве. Никогда не передаётся на серверы LiteDaemon.',
    it: 'Salvata localmente sul tuo dispositivo. Mai inviata ai server LiteDaemon.',
  }

  Object.entries(storedLocallyTexts).forEach(([lang, text]) => {
    i18n.addResourceBundle(
      lang,
      'translation',
      {
        settings: {
          storedLocally: text,
        },
      },
      true,
      true
    )
  })
}

