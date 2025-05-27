
import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [showLogo, setShowLogo] = useState(false);
  const [showMflix, setShowMflix] = useState(false);
  const [showSubtext, setShowSubtext] = useState(false);

  useEffect(() => {
    // Start with the red M animation
    setShowLogo(true);
    
    // Show MFLIX text after 2 seconds
    const mflixTimer = setTimeout(() => {
      setShowMflix(true);
    }, 2000);

    // Show Entertainment Hub text after 3 seconds
    const subtextTimer = setTimeout(() => {
      setShowSubtext(true);
    }, 3000);

    // Complete splash screen after exactly 5 seconds
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => {
      clearTimeout(mflixTimer);
      clearTimeout(subtextTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      {/* Red M Logo Animation */}
      <div className={`transition-all duration-1500 ${showLogo ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
        <img 
          src="/lovable-uploads/d893c6d0-27f6-4587-b460-81767b56a0d4.png" 
          alt="Mflix Logo" 
          className="w-32 h-32 mb-4 object-contain"
        />
      </div>

      {/* MFLIX Text */}
      <div className={`transition-all duration-1000 ${showMflix ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <h1 className="text-red-500 text-4xl font-bold text-center mb-2 tracking-wider">
          MFLIX
        </h1>
      </div>

      {/* Entertainment Hub Subtext */}
      <div className={`transition-all duration-1000 ${showSubtext ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <p className="text-white text-xl font-semibold text-center">
          ENTERTAINMENT HUB
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
