import { Metadata } from "next";
import { Providers } from "./_components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Vereinsbuch",
    default: "Vereinsbuch",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
