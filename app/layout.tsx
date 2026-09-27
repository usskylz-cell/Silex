import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppChrome } from "@/components/AppChrome";
import { CartProvider } from "@/lib/cart-context";

export const metadata: Metadata = {
  title: {
    default: "سوق سالكس | Salix",
    template: "%s | سوق سالكس",
  },
  description: "تسوّق مباشرةً من الصنّاع، اكتشف قطعاً صُممت لأجلك",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FAF8F5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-paper text-ink antialiased">
        <CartProvider>
          <AppChrome>{children}</AppChrome>
        </CartProvider>
      </body>
    </html>
  );
}
