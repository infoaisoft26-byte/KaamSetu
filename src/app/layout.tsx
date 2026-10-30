import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "KaamSetu | Local services, made simple", description: "Discover trusted local professionals and manage your service business with KaamSetu." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
