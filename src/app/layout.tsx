import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const body = Inter({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://harbor.school"),
  title: {
    default: "Harbor School Management",
    template: "%s | Harbor School Management",
  },
  description:
    "Modern school management platform for enrollment, attendance, grading, and parent communication. Built for administrators, teachers, students, and parents.",
  keywords: ["school management", "student information system", "attendance", "grading", "education"],
  openGraph: {
    title: "Harbor School Management",
    description: "Enrollment, attendance, and grades — one platform for your entire school.",
    url: "https://harbor.school",
    siteName: "Harbor School Management",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Harbor School Management",
    description: "Enrollment, attendance, and grades — one platform for your entire school.",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-full font-[family-name:var(--font-ui)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
