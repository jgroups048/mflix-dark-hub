
import { useState } from 'react';
import { Search, Menu, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onSearch: (query: string) => void;
}

const Header = ({ onSearch }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

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
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/80 border-b border-red-900/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <img 
              src="/lovable-uploads/d893c6d0-27f6-4587-b460-81767b56a0d4.png" 
              alt="Mflix Logo" 
              className="h-8 w-auto cursor-pointer" 
              onClick={() => navigate('/')}
            />
            <span className="text-red-500 text-xl font-bold tracking-wider hidden sm:block">MFLIX</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button onClick={() => navigate('/')} className="text-white hover:text-red-500 transition-colors">Home</button>
            <button onClick={() => scrollToSection('movies')} className="text-white hover:text-red-500 transition-colors">Movies</button>
            <button onClick={() => scrollToSection('webseries')} className="text-white hover:text-red-500 transition-colors">Web Series</button>
            <button onClick={() => scrollToSection('trending')} className="text-white hover:text-red-500 transition-colors">Trending</button>
            <button onClick={() => scrollToSection('latest')} className="text-white hover:text-red-500 transition-colors">Latest</button>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search movies, shows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-gray-900 border-gray-700 text-white placeholder-gray-400"
              />
            </div>
          </form>

          {/* User Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/auth')} className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
              <User className="w-4 h-4 mr-2" />
              Login
            </Button>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-700">
            <nav className="flex flex-col space-y-3 mt-4">
              <button onClick={() => { navigate('/'); setIsMenuOpen(false); }} className="text-white hover:text-red-500 transition-colors text-left">Home</button>
              <button onClick={() => scrollToSection('movies')} className="text-white hover:text-red-500 transition-colors text-left">Movies</button>
              <button onClick={() => scrollToSection('webseries')} className="text-white hover:text-red-500 transition-colors text-left">Web Series</button>
              <button onClick={() => scrollToSection('trending')} className="text-white hover:text-red-500 transition-colors text-left">Trending</button>
              <button onClick={() => scrollToSection('latest')} className="text-white hover:text-red-500 transition-colors text-left">Latest</button>
            </nav>
            
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search movies, shows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-400"
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
