import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const userObj = userStr ? JSON.parse(userStr) : null;
  const anonymousId = userObj?.anonymousId || "Profile";

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/features" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-primary">InTune</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-smooth hover-lift"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Auth / Profile Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {token ? (
              <Link to="/dashboard" className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-soft-sand bg-white hover:bg-light-cream transition-smooth shadow-sm">
                <div className="w-8 h-8 rounded-full bg-warm-brown text-white flex items-center justify-center font-bold text-xs">
                  {anonymousId.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-xs font-bold text-warm-brown">
                  {anonymousId}
                </span>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="minimal" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="hero" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-card-gradient rounded-lg mt-2 shadow-card">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium transition-smooth"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-4">
                {token ? (
                  <Link 
                    to="/dashboard" 
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-soft-sand bg-white text-sm font-semibold text-warm-brown"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="w-6 h-6 rounded-full bg-warm-brown text-white flex items-center justify-center font-bold text-xxs">
                      {anonymousId.slice(0, 2).toUpperCase()}
                    </div>
                    <span>{anonymousId}</span>
                  </Link>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="minimal" size="sm" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="hero" size="sm" className="w-full">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;