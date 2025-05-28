
import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    // Show logo immediately
    setShowLogo(true);
    
    // Complete splash screen after exactly 5 seconds
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => {
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 overflow-hidden">
      {/* Entertainment Hub Logo */}
      <div className={`transition-all duration-1000 ease-out ${showLogo ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
        <div className="relative">
          <img 
            src="/lovable-uploads/7747cf52-23e4-4d36-93ef-80dbc9a63304.png" 
            alt="Entertainment Hub Logo" 
            className="w-64 h-auto object-contain drop-shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
