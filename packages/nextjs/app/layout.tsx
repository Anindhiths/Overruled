import "@rainbow-me/rainbowkit/styles.css";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { Header } from "~~/components/Header";
import { Footer } from "~~/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Legal Battle Arena",
  description: "A blockchain-based legal game with AI-powered interactions",
};

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <ThemeProvider enableSystem>
                <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
              </ThemeProvider>
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
