import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Медцентр — электронная запись и заявки",
  description: "Информационная система электронной заявки в медицинский центр: запись на приём, обработка обращений и уведомления",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <Toaster />
        {children}
      </body>
    </html>
  );
}

