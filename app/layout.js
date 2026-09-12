import "./globals.css";
import Shell from "@/components/Shell";
import { StoreProvider } from "@/lib/store";

export const metadata = {
  title: "منصة إدارة المدرسة الابتدائية الطاهر صفر — حمام الأنف",
  description: "منصة المدير: الإسناد، جداول الأوقات، دفتر المناداة، العمل اليومي",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Tajawal:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <StoreProvider>
          <Shell>{children}</Shell>
        </StoreProvider>
      </body>
    </html>
  );
}
