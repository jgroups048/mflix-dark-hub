import React, { useState, useEffect, useRef } from 'react';
import { getSplashAdminSettings, SplashSettings, ObjectFitOptions } from '@/lib/firebaseServices/splashAdminService';

interface SplashScreenProps {
  onComplete: () => void;
  ignoreSessionStorage?: boolean;
  testSettings?: Omit<SplashSettings, 'updatedAt' | 'enabled'> & { enabled?: boolean };
}

// --- Default Fallback Assets ---
const FALLBACK_IMAGE_URL = '/defaults/default-splash-image.png'; 
const FALLBACK_VIDEO_URL = '/defaults/default-splash-video.mp4'; 
// --- End Default Fallback Assets ---

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, ignoreSessionStorage = false, testSettings }) => {
  const [activeSplashSettings, setActiveSplashSettings] = useState<SplashSettings | null>(null);
  const [effectiveMedia, setEffectiveMedia] = useState<{
    mode: 'image' | 'video';
    url: string;
    logoUrl?: string;
    audioUrl?: string;
    objectFit?: ObjectFitOptions;
    duration: number;
  } | null>(null);
  const [show, setShow] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const initSplash = async () => {
      if (testSettings) {
        const fullTestSettings: SplashSettings = {
          enabled: testSettings.enabled !== undefined ? testSettings.enabled : true,
          mode: testSettings.mode || 'image',
          imageUrl: testSettings.imageUrl,
          videoUrl: testSettings.videoUrl,
          logoUrl: testSettings.logoUrl,
          audioUrl: testSettings.audioUrl,
          objectFit: testSettings.objectFit || 'cover',
        };
        setActiveSplashSettings(fullTestSettings);
        return;
      }

      let fetchedSettings: SplashSettings | null = null;
      try {
        fetchedSettings = await getSplashAdminSettings();
        if (!fetchedSettings || !fetchedSettings.enabled) {
          onComplete();
          return;
        }
        const splashShownKey = 'mflixSplashScreenShown';
        if (!ignoreSessionStorage && sessionStorage.getItem(splashShownKey)) {
          onComplete();
          return;
        }
        setActiveSplashSettings(fetchedSettings);
        if (!ignoreSessionStorage) {
            sessionStorage.setItem(splashShownKey, 'true');
        }
      } catch (error) {
        console.error("[Splash] CRITICAL: Error fetching live splash settings:", error);
        setActiveSplashSettings({
          enabled: true,
          mode: 'image',
          objectFit: 'cover',
        } as SplashSettings); // Fallback to default image splash on error
      }
    };
    initSplash();
  }, [onComplete, ignoreSessionStorage, testSettings]);

  useEffect(() => {
    if (!activeSplashSettings) return;

    if (!activeSplashSettings.enabled && !testSettings) {
      onComplete();
      return;
    }
    
    const baseDuration = testSettings && (testSettings as any).duration ? (testSettings as any).duration : 5000;

    let determinedMode = activeSplashSettings.mode || 'image';
    let determinedUrl = '';
    const determinedObjectFit = activeSplashSettings.objectFit || 'cover';

    if (determinedMode === 'video') {
      if (activeSplashSettings.videoUrl) {
        determinedUrl = activeSplashSettings.videoUrl;
      } else {
        determinedUrl = FALLBACK_VIDEO_URL;
      }
    } else { 
      determinedMode = 'image'; 
      if (activeSplashSettings.imageUrl) {
        determinedUrl = activeSplashSettings.imageUrl;
      } else {
        determinedUrl = FALLBACK_IMAGE_URL;
      }
    }
    
    setEffectiveMedia({ 
        mode: determinedMode, 
        url: determinedUrl, 
        logoUrl: activeSplashSettings.logoUrl, 
        audioUrl: activeSplashSettings.audioUrl, 
        objectFit: determinedObjectFit,
        duration: baseDuration,
    });

  }, [activeSplashSettings, onComplete, testSettings]);

  useEffect(() => {
    if (!effectiveMedia) return;

    let timeoutId: NodeJS.Timeout | undefined = undefined;
    const { mode, url, audioUrl, duration } = effectiveMedia;

    const completeAndFadeOut = () => {
      if (timeoutId) clearTimeout(timeoutId); 
      setShow(false);
      setTimeout(onComplete, 500); 
    };

    if (mode === 'video' && videoRef.current) {
      const videoElement = videoRef.current;
      videoElement.src = url; 

      const onVideoEnd = () => completeAndFadeOut();
      const onVideoError = () => {
        setEffectiveMedia(prev => ({ 
            ...(prev || {} as any), 
            mode: 'image', 
            url: FALLBACK_IMAGE_URL,
            objectFit: 'contain'
        }));
      };
      const onCanPlay = () => videoElement.play().catch(err => console.warn("Video play promise rejected", err));

      videoElement.addEventListener('canplay', onCanPlay);
      videoElement.addEventListener('ended', onVideoEnd);
      videoElement.addEventListener('error', onVideoError);
      timeoutId = setTimeout(completeAndFadeOut, duration); 
      
      return () => {
        videoElement.removeEventListener('canplay', onCanPlay);
        videoElement.removeEventListener('ended', onVideoEnd);
        videoElement.removeEventListener('error', onVideoError);
        if (timeoutId) clearTimeout(timeoutId);
      };
    } else if (mode === 'image') {
      if (!url) {
        onComplete();
        return;
      }
      timeoutId = setTimeout(completeAndFadeOut, duration);
    } else {
      onComplete(); 
      return;
    }

    let soundTimeoutId: NodeJS.Timeout | undefined = undefined;
    if (audioUrl && audioRef.current) {
      const audioElement = audioRef.current;
      audioElement.src = audioUrl;
      audioElement.play().catch(err => console.warn("Audio autoplay failed", err));
      soundTimeoutId = setTimeout(() => {
         if(audioElement && !audioElement.paused) {
           audioElement.pause();
           audioElement.currentTime = 0; 
         }
       }, duration); 
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (soundTimeoutId) clearTimeout(soundTimeoutId);
    };
  }, [effectiveMedia, onComplete]);

  if (!effectiveMedia || !show) { 
    return null; 
  }
  
  const commonOverlayStyles: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '80%',        
    maxHeight: '60%',       
    zIndex: 10,
  };

  const mediaStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: effectiveMedia.objectFit || 'cover',
  };

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center transition-opacity duration-500 ease-in-out ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      {effectiveMedia.mode === 'video' && effectiveMedia.url && (
        <video
          ref={videoRef}
          muted
          playsInline 
          style={mediaStyle}
          key={effectiveMedia.url} // Added key to re-trigger load on URL change
        />
      )}
      {effectiveMedia.mode === 'image' && effectiveMedia.url && (
        <img 
          src={effectiveMedia.url} 
          alt="Splash Screen" 
          style={mediaStyle}
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK_IMAGE_URL; 
            (e.target as HTMLImageElement).alt = "Default Fallback Splash Image";
            (e.target as HTMLImageElement).style.objectFit = 'contain';
          }}
          key={effectiveMedia.url} // Added key to re-trigger load on URL change
        />
      )}
      {effectiveMedia.logoUrl && (
        <img 
          src={effectiveMedia.logoUrl} 
          alt="Logo Overlay" 
          style={commonOverlayStyles}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}
      {effectiveMedia.audioUrl && <audio ref={audioRef} />} 
    </div>
  );
};

export default SplashScreen;
