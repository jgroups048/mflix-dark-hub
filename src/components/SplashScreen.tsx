
import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [showM, setShowM] = useState(false);
  const [showMflix, setShowMflix] = useState(false);
  const [showHub, setShowHub] = useState(false);
  const [showPowered, setShowPowered] = useState(false);

  useEffect(() => {
    // Show animated red "M" immediately
    setShowM(true);
    
    // Show MFLIX text after 2 seconds
    const mflixTimer = setTimeout(() => {
      setShowMflix(true);
    }, 2000);

    // Show ENTERTAINMENT HUB after 2.5 seconds
    const hubTimer = setTimeout(() => {
      setShowHub(true);
    }, 2500);

    // Show "Powered by J GROUPS" after 3 seconds
    const poweredTimer = setTimeout(() => {
      setShowPowered(true);
    }, 3000);

    // Complete splash screen after exactly 5 seconds
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => {
      clearTimeout(mflixTimer);
      clearTimeout(hubTimer);
      clearTimeout(poweredTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 overflow-hidden">
      {/* Animated Red "M" */}
      <div className={`transition-all duration-1500 ease-out ${showM ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
        <div className="relative">
          {/* Glowing red "M" */}
          <div className="text-red-500 text-9xl font-bold mb-4 animate-pulse">
            <span className="drop-shadow-[0_0_20px_rgba(239,68,68,0.7)]">M</span>
          </div>
          {/* Additional glow effect */}
          <div className="absolute inset-0 text-red-500 text-9xl font-bold blur-sm opacity-60">
            M
          </div>
        </div>
      </div>

      {/* MFLIX Text */}
      <div className={`transition-all duration-1000 ease-out ${showMflix ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <h1 className="text-red-500 text-6xl font-bold text-center mb-2 tracking-wider drop-shadow-lg">
          MFLIX
        </h1>
      </div>

      {/* ENTERTAINMENT HUB */}
      <div className={`transition-all duration-1000 ease-out ${showHub ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <h2 className="text-white text-2xl font-bold text-center mb-4 tracking-wide">
          ENTERTAINMENT HUB
        </h2>
      </div>

      {/* Powered by J GROUPS */}
      <div className={`transition-all duration-1000 ease-out ${showPowered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <p className="text-gray-400 text-lg italic text-center">
          Powered by J GROUPS
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
