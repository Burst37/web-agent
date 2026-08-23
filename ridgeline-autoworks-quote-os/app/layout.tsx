import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ridgeline Autoworks | Dynamic Quoting Engine',
  description: 'Precision auto repair diagnostics and instant quoting.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
