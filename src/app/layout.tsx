import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { Toaster } from 'sonner';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'WithUs Todo',
  description: 'A professional task management application.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  verification: {
    google: '22lfROplFWCdORfEAIU0M0IKJIT5okcjgWa4Uzi31Cg',
  },
  other: {
    'google-site-verification': '22lfROplFWCdORfEAIU0M0IKJIT5okcjgWa4Uzi31Cg',
  },
};

/**
 * Root layout component wrapping the entire application.
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="22lfROplFWCdORfEAIU0M0IKJIT5okcjgWa4Uzi31Cg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster position="bottom-right" />
          </ThemeProvider>
        </NextIntlClientProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function purgeNetlify() {
                  var selectors = [
                    '[id*="netlify"]',
                    '[class*="netlify"]',
                    '[data-netlify-deploy-id]',
                    '[aria-label*="Netlify"]',
                    'iframe[title*="Netlify"]'
                  ];
                  selectors.forEach(function(s) {
                    var els = document.querySelectorAll(s);
                    for (var i = 0; i < els.length; i++) {
                      els[i].style.setProperty('display', 'none', 'important');
                      els[i].remove();
                    }
                  });
                }
                if (typeof window !== 'undefined') {
                  window.addEventListener('DOMContentLoaded', purgeNetlify);
                  var observer = new MutationObserver(purgeNetlify);
                  observer.observe(document.documentElement, { childList: true, subtree: true });
                }
              })();
            `
          }}
        />
      </body>
    </html>
  );
}
