import type { Metadata } from "next";
import AppThemeProvider from "@/components/layout/AppThemeProvider";

export const metadata: Metadata = {
  title: "Pilot Notes App",
  description: "A simple text-only notes app pilot built with Next.js and MUI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppThemeProvider>{children}</AppThemeProvider>
      </body>
    </html>
  );
}