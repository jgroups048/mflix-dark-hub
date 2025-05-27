
import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [showLogo, setShowLogo] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showSubtext, setShowSubtext] = useState(false);

  useEffect(() => {
    // Start logo animation immediately
    setShowLogo(true);
    
    // Show main text after 1.5 seconds
    const textTimer = setTimeout(() => {
      setShowText(true);
    }, 1500);

    // Show subtext after 2.5 seconds
    const subtextTimer = setTimeout(() => {
      setShowSubtext(true);
    }, 2500);

    // Complete splash screen after exactly 5 seconds
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(subtextTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      {/* Logo Animation */}
      <div className={`transition-all duration-1000 ${showLogo ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
        <img 
          src="/lovable-uploads/e95a9e32-94d3-4f3b-9789-7031f82934e0.png" 
          alt="Mflix Logo" 
          className="w-32 h-auto mb-8"
        />
      </div>

      {/* Main Text */}
      <div className={`transition-all duration-1000 ${showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <h1 className="text-white text-2xl font-bold text-center mb-4">
          Entertainment HUB
        </h1>
      </div>

      {/* Subtext */}
      <div className={`transition-all duration-1000 ${showSubtext ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <p className="text-gray-400 text-sm italic text-center">
          Powered by J GROUPS
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
