import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

/**
 * Configure next-intl for the server.
 * Uses a cookie or a default locale for determining user preference.
 * Provides fallback handling so missing keys never throw uncaught exceptions.
 */
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'ko';

  let messages = {};
  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch {
    messages = (await import('../messages/ko.json')).default;
  }

  return {
    locale,
    messages,
    onError(error) {
      // Suppress noisy missing message errors in production
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('[next-intl]', error.message);
      }
    },
    getMessageFallback({ key, namespace }) {
      return namespace ? `${namespace}.${key}` : key;
    },
  };
});
