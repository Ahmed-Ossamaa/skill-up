import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import AuthProvider from '../components/providers/AuthProvider';
import { Toaster } from 'react-hot-toast';


const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'LearnHub - Online Learning Platform',
  description: 'Learn new skills with expert-taught courses',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
              style: { fontSize: '14px',marginTop: '55px' },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
