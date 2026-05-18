import './globals.css';
import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { AuthProvider } from '@/contexts/auth-context';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://eduforge-lms.vercel.app'),
  title: 'EduForge — Learn. Build. Grow.',
  description: 'A modern learning management system to create, discover, and master skills with expert-led courses.',
  openGraph: {
    title: 'EduForge — Learn. Build. Grow.',
    description: 'A modern learning management system for creators and learners.',
    images: [{ url: 'https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg?w=1200' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
