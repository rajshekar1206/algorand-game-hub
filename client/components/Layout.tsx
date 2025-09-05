import Navigation from "./Navigation";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-game-bg dark">
      <Navigation />
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2"></div>

            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Docs
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Support
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                About
              </a>
            </div>

            <div className="text-sm text-muted-foreground">
              © 2024 Algorand Game Hub. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
