
import { Youtube, Facebook, Instagram, Send } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black border-t border-red-900/20 mt-16">
      <div className="container mx-auto px-4 py-12">
        {/* About Section */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/lovable-uploads/d893c6d0-27f6-4587-b460-81767b56a0d4.png" 
              alt="Mflix Logo" 
              className="h-16 w-auto mr-4"
            />
            <div>
              <h3 className="text-2xl font-bold text-red-500 tracking-wider">MFLIX</h3>
              <p className="text-white text-sm">ENTERTAINMENT HUB</p>
            </div>
          </div>
          <p className="text-gray-300 max-w-3xl mx-auto leading-relaxed text-lg">
            Mflix is your one-stop entertainment hub bringing you the best of movies and web series across genres. 
            Powered by J GROUPS, crafted for your binge-worthy moments.
          </p>
        </div>

        {/* Connect with Us Section */}
        <div className="mb-8">
          <h4 className="text-xl font-semibold text-white text-center mb-6">Connect with Us</h4>
          <div className="flex justify-center space-x-6">
            <a 
              href="https://www.youtube.com/@Jgroupsentertainmenthub048" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
            >
              <Youtube className="w-6 h-6" />
            </a>
            <a 
              href="https://www.facebook.com/profile.php?id=61573079981019" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
            >
              <Facebook className="w-6 h-6" />
            </a>
            <a 
              href="https://www.instagram.com/mflix_entertainmenthub?igsh=eTFrOHY4bmNnYmli" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
            >
              <Instagram className="w-6 h-6" />
            </a>
            <a 
              href="https://t.me/+nRJaGvh8DMNlMzNl" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
            >
              <Send className="w-6 h-6" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-red-500 transition-colors">Home</a></li>
              <li><a href="#movies" className="hover:text-red-500 transition-colors">Movies</a></li>
              <li><a href="#webseries" className="hover:text-red-500 transition-colors">Web Series</a></li>
              <li><a href="#trending" className="hover:text-red-500 transition-colors">Trending</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Categories</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-red-500 transition-colors">Action</a></li>
              <li><a href="#" className="hover:text-red-500 transition-colors">Comedy</a></li>
              <li><a href="#" className="hover:text-red-500 transition-colors">Drama</a></li>
              <li><a href="#" className="hover:text-red-500 transition-colors">Thriller</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-red-500 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-red-500 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-red-500 transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-red-500 transition-colors">DMCA</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Support</li>
              <li>Partnerships</li>
              <li>Advertise</li>
              <li>Press</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 Mflix Entertainment HUB. All rights reserved. Powered by J GROUPS.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
