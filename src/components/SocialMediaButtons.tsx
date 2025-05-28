
import { Youtube, Facebook, Instagram, MessageCircle } from 'lucide-react';

const SocialMediaButtons = () => {
  const socialLinks = [
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/@Jgroupsentertainmenthub048',
      icon: Youtube,
      color: 'hover:bg-red-600'
    },
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/profile.php?id=61573079981019',
      icon: Facebook,
      color: 'hover:bg-blue-600'
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/mflix_entertainmenthub?igsh=eTFrOHY4bmNnYmli',
      icon: Instagram,
      color: 'hover:bg-pink-600'
    },
    {
      name: 'Telegram',
      url: 'https://t.me/+nRJaGvh8DMNlMzNl',
      icon: MessageCircle,
      color: 'hover:bg-blue-500'
    }
  ];

  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40 space-y-3">
      {socialLinks.map((link) => {
        const Icon = link.icon;
        return (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center w-12 h-12 bg-gray-900/80 backdrop-blur rounded-full text-white transition-all duration-300 ${link.color} hover:scale-110 shadow-lg hover:shadow-xl`}
            title={link.name}
          >
            <Icon className="w-5 h-5" />
          </a>
        );
      })}
    </div>
  );
};

export default SocialMediaButtons;
