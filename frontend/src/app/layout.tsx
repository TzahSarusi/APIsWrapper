import type { Metadata } from "next";
// Inter font is imported in globals.css via Google Fonts link
import "./globals.css";

export const metadata: Metadata = {
  title: "API Workflow Builder", // Updated title
  description: "Visually build and manage API workflows", // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* The className for fonts is removed as font-family is globally set on body in globals.css */}
      {/* antialiased can be kept for smoother fonts */}
      <body className="antialiased"> 
        {children}
      </body>
    </html>
  );
}

/*test*/