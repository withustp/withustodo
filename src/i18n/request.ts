import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

/**
 * Configure next-intl for the server.
 * Uses a cookie or a default locale for determining user preference.
 */
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
