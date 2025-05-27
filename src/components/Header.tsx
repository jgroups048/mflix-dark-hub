
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

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <img 
              src="/lovable-uploads/e95a9e32-94d3-4f3b-9789-7031f82934e0.png" 
              alt="Mflix Logo" 
              className="h-10 w-auto cursor-pointer" 
              onClick={() => navigate('/')}
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#latest" className="text-muted-foreground hover:text-foreground transition-colors">Latest</a>
            <a href="#trending" className="text-muted-foreground hover:text-foreground transition-colors">Trending</a>
            <a href="#webseries" className="text-muted-foreground hover:text-foreground transition-colors">Web Series</a>
            <a href="#movies" className="text-muted-foreground hover:text-foreground transition-colors">Movies</a>
            <a href="#livetv" className="text-muted-foreground hover:text-foreground transition-colors">Live TV</a>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search movies, shows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-secondary border-border"
              />
            </div>
          </form>

          {/* User Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
              <User className="w-4 h-4 mr-2" />
              Login
            </Button>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border">
            <nav className="flex flex-col space-y-3 mt-4">
              <a href="#latest" className="text-muted-foreground hover:text-foreground transition-colors">Latest</a>
              <a href="#trending" className="text-muted-foreground hover:text-foreground transition-colors">Trending</a>
              <a href="#webseries" className="text-muted-foreground hover:text-foreground transition-colors">Web Series</a>
              <a href="#movies" className="text-muted-foreground hover:text-foreground transition-colors">Movies</a>
              <a href="#livetv" className="text-muted-foreground hover:text-foreground transition-colors">Live TV</a>
            </nav>
            
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search movies, shows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-secondary border-border"
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
