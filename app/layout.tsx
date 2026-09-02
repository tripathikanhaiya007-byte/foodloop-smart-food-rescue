import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "FoodLoop – Smart Food Rescue", description: "Connect surplus food with nearby NGOs and track every rescued meal.", icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" } };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
