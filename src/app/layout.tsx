import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});

const body = Plus_Jakarta_Sans({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000"),
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

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-full font-[family-name:var(--font-ui)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
