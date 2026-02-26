import type { Metadata, Viewport } from "next";
import "../styles.css";

export const metadata: Metadata = {
  title: "MastiMinds",
  description: "MastiMinds Games - Number Strike. Created by dp. Contact: 8320838017",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#a8d8ff",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="format-detection" content="telephone=no" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="preload" as="image" href="/icon_home.png" />
        <link rel="preload" as="image" href="/icon_panjat.png" />
        <link rel="preload" as="image" href="/tiang.png" />
        <link rel="preload" as="image" href="/standleft.png" />
        <link rel="preload" as="image" href="/standright.png" />
        <link rel="preload" as="image" href="/climbleft.png" />
        <link rel="preload" as="image" href="/climbright.png" />
        <link rel="preload" as="image" href="/king.png" />
        <link rel="preload" as="image" href="/villain.png" />
        <link rel="preload" as="image" href="/space_red.png" />
        <link rel="preload" as="image" href="/space_blue.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
