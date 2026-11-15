import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Zan Cafe | Artisanal Bistro & Gourmet Kitchen | Melapalayam, Tirunelveli",
  description: "Experience premium dining at Zan Cafe in Melapalayam, Tirunelveli. Artisanal coffees, wood-fired pizzas, gourmet burgers, and authentic Melapalayam sizzles.",
  keywords: ["Zan Cafe", "Melapalayam Restaurant", "Tirunelveli Cafe", "Gourmet Burgers", "Coffee Melapalayam", "Zan Cafe Melapalayam"],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-espresso text-ivory antialiased min-h-screen selection:bg-gold selection:text-espresso-950 font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
