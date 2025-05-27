
import { Youtube, Facebook, Instagram, Send } from 'lucide-react';

const ReelTemplate = () => {
  return (
    <div className="relative w-full h-screen bg-black flex flex-col justify-between p-6 text-white">
      {/* Top Section - Logo */}
      <div className="flex justify-start">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
          <span className="text-red-500 text-2xl font-bold tracking-wider drop-shadow-lg">
            MFLIX
          </span>
        </div>
      </div>

      {/* Center Area - Empty for video content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500 opacity-50">
          {/* This area is left empty for video content overlay */}
          <div className="text-sm">Video Content Area</div>
        </div>
      </div>

      {/* Bottom Section - Social Info */}
      <div className="space-y-4">
        {/* Call to Action */}
        <div className="text-center bg-black/50 backdrop-blur-sm rounded-lg py-3 px-4">
          <p className="text-white font-semibold text-lg mb-2">
            Follow @Mflix_EntertainmentHub for more!
          </p>
          <p className="text-gray-300 text-sm">
            Your Entertainment Hub | Powered by J GROUPS
          </p>
        </div>

        {/* Social Media Icons */}
        <div className="flex justify-center space-x-4">
          <div className="bg-red-600 rounded-full p-2">
            <Youtube className="w-5 h-5" />
          </div>
          <div className="bg-blue-600 rounded-full p-2">
            <Facebook className="w-5 h-5" />
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-2">
            <Instagram className="w-5 h-5" />
          </div>
          <div className="bg-blue-500 rounded-full p-2">
            <Send className="w-5 h-5" />
          </div>
        </div>

        {/* Social Handles */}
        <div className="text-center text-sm text-gray-300 space-y-1">
          <p>@Jgroupsentertainmenthub048</p>
          <p>@mflix_entertainmenthub</p>
        </div>
      </div>
    </div>
  );
};

export default ReelTemplate;
