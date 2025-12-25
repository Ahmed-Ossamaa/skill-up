import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import AuthProvider from '../components/providers/AuthProvider';
import { Toaster } from 'react-hot-toast';
import { de } from 'zod/v4/locales';


const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});


export const metadata = {
  title: {
    default: 'Skill-Up | Learn New Skills Online',
    template: '%s | Skill-Up'
  },

  description: 'Learn new skills with expert-taught courses',
  metadataBase: new URL('https://skill-up-edu.vercel.app'),

  openGraph: {
    images: ['/home-banner-og.png'],
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
              style: { fontSize: '14px', marginTop: '55px' },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
