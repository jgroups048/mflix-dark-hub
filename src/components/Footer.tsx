import { useState, useEffect } from 'react';
import { Youtube, Facebook, Instagram, Send } from 'lucide-react';
import { getSiteSettings } from '@/lib/firebaseServices/siteSettingsService';

const Footer = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const settings = await getSiteSettings();
        if (settings && settings.logoUrl) {
          setLogoUrl(settings.logoUrl);
        } else {
          setLogoUrl(null);
        }
      } catch (error) {
        console.error("Failed to fetch logo for footer:", error);
        setLogoUrl(null);
      }
    };
    fetchLogo();
  }, []);

  return (
    <footer className="bg-black border-t border-red-900/30 mt-16">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="mb-12 text-center">
          {/* MFLIX Branding */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="MFLIX Logo" 
                  className="w-16 h-16 object-contain"
                />
              ) : (
                <div className="w-16 h-16 flex items-center justify-center text-red-500 font-bold text-4xl">M</div>
              )}
              <div>
                {/* 
                <h3 className="text-4xl font-bold text-red-500 tracking-wider drop-shadow-lg mb-2">
                  MFLIX
                </h3>
                <p className="text-white text-lg font-semibold">ENTERTAINMENT HUB</p> 
                */}
                <p className="text-gray-400 text-sm italic mt-1 sm:mt-0 sm:ml-[-6rem]">Your Ultimate Entertainment Destination</p>
              </div>
            </div>
          </div>
          
          {/* About Description */}
          <div className="max-w-4xl mx-auto mb-8">
            <p className="text-gray-300 leading-relaxed text-lg">
              MFLIX Entertainment Hub is your one-stop destination for movies and web series. 
              Experience the best in entertainment with our vast collection of content, 
              stunning visuals, and modern streaming technology.
            </p>
          </div>
        </div>

        {/* Connect with Us Section - Fixed Social Media Buttons */}
        <div className="mb-8">
          <h4 className="text-2xl font-bold text-white text-center mb-6">Connect with Us</h4>
          <div className="flex justify-center space-x-6">
            <a 
              href="https://www.youtube.com/@Jgroupsentertainmenthub048" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
            >
              <Youtube className="w-6 h-6" />
            </a>
            <a 
              href="https://www.facebook.com/profile.php?id=61573079981019" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
            >
              <Facebook className="w-6 h-6" />
            </a>
            <a 
              href="https://www.instagram.com/mflix_entertainmenthub?igsh=eTFrOHY4bmNnYmli" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
            >
              <Instagram className="w-6 h-6" />
            </a>
            <a 
              href="https://t.me/+nRJaGvh8DMNlMzNl" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
            >
              <Send className="w-6 h-6" />
            </a>
          </div>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4 text-white text-lg">Quick Links</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><a href="#" className="hover:text-red-500 transition-colors">Home</a></li>
              <li><a href="#latest" className="hover:text-red-500 transition-colors">Latest Movies</a></li>
              <li><a href="#webseries" className="hover:text-red-500 transition-colors">Web Series</a></li>
              <li><a href="#trending" className="hover:text-red-500 transition-colors">Trending</a></li>
            </ul>
          </div>

          {/* Genres */}
          <div>
            <h4 className="font-bold mb-4 text-white text-lg">Genres</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><a href="#" className="hover:text-red-500 transition-colors">Action</a></li>
              <li><a href="#" className="hover:text-red-500 transition-colors">Comedy</a></li>
              <li><a href="#" className="hover:text-red-500 transition-colors">Drama</a></li>
              <li><a href="#" className="hover:text-red-500 transition-colors">Thriller</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold mb-4 text-white text-lg">Support</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><a href="#" className="hover:text-red-500 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-red-500 transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-red-500 transition-colors">Report Issue</a></li>
              <li><a href="#" className="hover:text-red-500 transition-colors">Feedback</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold mb-4 text-white text-lg">Legal</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><a href="#" className="hover:text-red-500 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-red-500 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-red-500 transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-red-500 transition-colors">DMCA</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 MFLIX Entertainment Hub. All rights reserved. Your Ultimate Entertainment Destination.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
