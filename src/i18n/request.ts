import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

/**
 * Configure next-intl for the server.
 * Uses a cookie or a default locale for determining user preference.
 * Provides clean fallback handling so raw developer paths never leak to the UI.
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
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('[next-intl]', error.message);
      }
    },
    getMessageFallback({ key }) {
      // Return the humanized last segment instead of the full raw dot path
      const lastSegment = key.split('.').pop() || key;
      return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
    },
  };
});
