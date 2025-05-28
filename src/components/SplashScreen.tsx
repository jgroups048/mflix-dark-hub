
import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [showLogo, setShowLogo] = useState(false);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    // Show logo immediately
    setShowLogo(true);
    
    // Show "Entertainment HUB" text after 5 seconds
    const textTimer = setTimeout(() => {
      setShowText(true);
    }, 5000);

    // Complete splash screen after 8 seconds total
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 8000);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 overflow-hidden">
      {/* MFLIX Logo */}
      <div className={`transition-all duration-1000 ease-out ${showLogo ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
        <div className="relative mb-8">
          <img 
            src="/lovable-uploads/8f44525e-2d28-4adb-adc9-c47803919a9f.png" 
            alt="MFLIX Logo" 
            className="w-48 h-48 object-contain drop-shadow-2xl"
          />
        </div>
      </div>

      {/* Entertainment HUB Text */}
      <div className={`transition-all duration-1000 ease-out ${showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <h2 className="text-white text-3xl font-bold text-center tracking-wide">
          Entertainment HUB
        </h2>
      </div>
    </div>
  );
};

export default SplashScreen;
