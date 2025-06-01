import { useState, useEffect } from 'react';
import { Search, Menu, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { getSiteSettings } from '@/lib/firebaseServices/siteSettingsService';

interface HeaderProps {
  onSearch: (query: string) => void;
}

const Header = ({ onSearch }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const settings = await getSiteSettings();
        if (settings && settings.logoUrl) {
          setLogoUrl(settings.logoUrl);
          console.log("Fetched Logo URL:", settings.logoUrl);
        } else {
          setLogoUrl('/default-logo.png');
          console.log("No logoUrl found or settings missing, using fallback.");
        }
      } catch (error) {
        console.error("Failed to fetch logo:", error);
        setLogoUrl('/default-logo.png');
      }
    };
    fetchLogo();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-md supports-[backdrop-filter]:bg-black/90 border-b border-red-900/30">
      <div className="container mx-auto px-6 sm:px-4 md:px-8 pt-3 pb-2 sm:py-3">
        <div className="flex items-center justify-between">
          {/* Entertainment Hub Logo */}
          <div className="flex items-center space-x-4">
            <div
              className="cursor-pointer flex items-center w-1/4"
              onClick={() => navigate('/')}
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Site Logo"
                  className="w-full h-auto object-contain"
                />
              ) : (
                <span className="text-red-500 text-3xl sm:text-4xl md:text-5xl font-bold tracking-wider drop-shadow-lg w-full text-center">
                  MFLIX
                </span>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => navigate('/')} 
              className="text-white hover:text-red-500 transition-colors font-semibold"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('latest')} 
              className="text-white hover:text-red-500 transition-colors font-semibold"
            >
              Latest Releases
            </button>
            <button 
              onClick={() => scrollToSection('webseries')} 
              className="text-white hover:text-red-500 transition-colors font-semibold"
            >
              Web Series
            </button>
            <button 
              onClick={() => scrollToSection('trending')} 
              className="text-white hover:text-red-500 transition-colors font-semibold"
            >
              Popular
            </button>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search movies, series..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-gray-900/80 border-gray-700 text-white placeholder-gray-400 focus:border-red-500"
              />
            </div>
          </form>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-white hover:text-red-500"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-700 bg-black/95 rounded-lg">
            <nav className="flex flex-col space-y-4 mt-4 px-4">
              <button 
                onClick={() => { navigate('/'); setIsMenuOpen(false); }} 
                className="text-white hover:text-red-500 transition-colors text-left font-semibold py-2"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('latest')} 
                className="text-white hover:text-red-500 transition-colors text-left font-semibold py-2"
              >
                Latest Releases
              </button>
              <button 
                onClick={() => scrollToSection('webseries')} 
                className="text-white hover:text-red-500 transition-colors text-left font-semibold py-2"
              >
                Web Series Collection
              </button>
              <button 
                onClick={() => scrollToSection('trending')} 
                className="text-white hover:text-red-500 transition-colors text-left font-semibold py-2"
              >
                Popular Right Now
              </button>
            </nav>
            
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mt-4 px-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search movies, series..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-900/80 border-gray-700 text-white placeholder-gray-400 focus:border-red-500"
                />
              </div>
            </form>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
