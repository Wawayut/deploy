import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Montserrat, Public_Sans } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import { StoreProvider } from '@/lib/store/provider'
import './globals.css'

const publicSans = Public_Sans({ subsets: ['latin'], variable: '--font-public-sans', weight: ['400', '500', '600', '700'] })
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat', weight: ['500', '600', '700'] })

export const metadata: Metadata = {
  title: { default: 'CHARMS — HOA Records Management', template: '%s · CHARMS' },
  description:
    'CHARMS is the community and homeowners association records management system for households, dues, payments, service requests and violations.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7F9FA' },
    { media: '(prefers-color-scheme: dark)', color: '#0F1A1F' },
  ],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${publicSans.variable} ${montserrat.variable}`}>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <StoreProvider>{children}</StoreProvider>
          <Toaster position="bottom-center" />
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
