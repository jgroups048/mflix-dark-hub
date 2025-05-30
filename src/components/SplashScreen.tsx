import React, { useState, useEffect, useRef } from 'react';
import { getSplashAdminSettings, SplashSettings, ObjectFitOptions } from '@/lib/firebaseServices/splashAdminService';

interface SplashScreenProps {
  onComplete: () => void;
  ignoreSessionStorage?: boolean;
  testSettings?: Omit<SplashSettings, 'updatedAt' | 'enabled'> & { enabled?: boolean };
}

// --- Default Fallback Assets ---
// Ensure these paths are correct and files exist in your /public directory
const FALLBACK_IMAGE_URL = '/defaults/default-splash-image.png'; // REPLACE with your actual path
const FALLBACK_VIDEO_URL = '/defaults/default-splash-video.mp4'; // REPLACE with your actual path
// --- End Default Fallback Assets ---

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, ignoreSessionStorage = false, testSettings }) => {
  console.log('[Splash] Component rendered. Ignore session storage:', ignoreSessionStorage, 'Test settings provided:', !!testSettings);
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
    console.log('[Splash] Effect 1: Initializing settings load or using testSettings.');
    const initSplash = async () => {
      if (testSettings) {
        console.log('[Splash] Using provided testSettings:', testSettings);
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
        if (!ignoreSessionStorage) {
            const splashShownKey = 'mflixSplashScreenShown';
            console.log('[Splash] Test run, session storage marking skipped.');
        }
        return;
      }

      let fetchedSettings: SplashSettings | null = null;
      try {
        console.log('[Splash] Fetching live splash settings from Firebase (splashAdminService)...');
        fetchedSettings = await getSplashAdminSettings();
        console.log('[Splash] Live settings fetched:', fetchedSettings);

        if (!fetchedSettings || !fetchedSettings.enabled) {
          console.log('[Splash] Live settings indicate splash is NOT enabled or no settings found. Calling onComplete.');
          onComplete();
          return;
        }

        const splashShownKey = 'mflixSplashScreenShown';
        if (!ignoreSessionStorage && sessionStorage.getItem(splashShownKey)) {
          console.log('[Splash] Already shown in session (live mode). Calling onComplete.');
          onComplete();
          return;
        }
        
        setActiveSplashSettings(fetchedSettings);
        if (!ignoreSessionStorage) {
            sessionStorage.setItem(splashShownKey, 'true');
            console.log('[Splash] Marked as shown in session (live mode).');
        }

      } catch (error) {
        console.error("[Splash] CRITICAL: Error fetching live splash settings:", error);
        console.log('[Splash] Using FALLBACK (default image) due to Firebase fetch error for live settings.');
        setActiveSplashSettings({
          enabled: true,
          mode: 'image',
          objectFit: 'cover',
        } as SplashSettings);
      }
    };
    initSplash();
  }, [onComplete, ignoreSessionStorage, testSettings]);

  useEffect(() => {
    console.log('[Splash] Effect 2: Determining effective media. Active settings:', activeSplashSettings);
    if (!activeSplashSettings) {
      console.log('[Splash] Active settings not yet processed, cannot determine effective media.');
      return;
    }

    if (!activeSplashSettings.enabled && !testSettings) {
      console.log('[Splash] Splash is not enabled based on active settings. Calling onComplete (from effect 2).');
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
        console.log(`[Splash] Using video URL: ${determinedUrl}`);
      } else {
        console.warn('[Splash] Video mode selected but no videoUrl. Using FALLBACK VIDEO.');
        determinedUrl = FALLBACK_VIDEO_URL;
      }
    } else { 
      determinedMode = 'image'; 
      if (activeSplashSettings.imageUrl) {
        determinedUrl = activeSplashSettings.imageUrl;
        console.log(`[Splash] Using image URL: ${determinedUrl}`);
      } else {
        console.warn('[Splash] Image mode (or fallback) but no imageUrl. Using FALLBACK IMAGE.');
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
    console.log('[Splash] Effect 3: Main playback/display. Effective media:', effectiveMedia);
    if (!effectiveMedia) {
      console.log('[Splash] Effective media not yet available for playback logic.');
      return;
    }

    let timeoutId: NodeJS.Timeout | undefined = undefined;
    const { mode, url, audioUrl, duration, objectFit } = effectiveMedia;
    console.log(`[Splash] EFFECTIVE - Mode: ${mode}, URL: ${url}, Duration: ${duration}ms, ObjectFit: ${objectFit}`);

    const completeAndFadeOut = () => {
      console.log('[Splash] completeAndFadeOut called.');
      if (timeoutId) clearTimeout(timeoutId); 
      setShow(false);
      setTimeout(() => {
        console.log('[Splash] Fade out complete. Calling actual onComplete for app display.');
        onComplete();
      }, 500); 
    };

    if (mode === 'video') {
      console.log('[Splash] Video mode processing. Video URL:', url);
      if (videoRef.current) {
        const videoElement = videoRef.current;
        videoElement.src = url; 

        const onVideoEnd = () => {
            console.log(`[Splash] Video 'ended' event triggered.`);
            completeAndFadeOut();
        };
        const onVideoError = (e: Event) => {
            console.error(`[Splash] Video 'error' event triggered:`, e);
            console.warn('[Splash] Video error. Using FALLBACK IMAGE instead of stuck video.');
            setEffectiveMedia(prev => ({ 
                ...(prev || {} as any), 
                mode: 'image', 
                url: FALLBACK_IMAGE_URL,
                objectFit: 'contain'
            }));
        };
        const onCanPlay = () => {
            console.log('[Splash] Video "canplay" event. Attempting to play video.');
            videoElement.play().catch(err => {
              console.warn("[Splash] Video play() promise rejected (e.g., autoplay policy):", err); 
              console.log('[Splash] Video autoplay failed, relying on duration timer for completion.');
            });
        };

        videoElement.addEventListener('canplay', onCanPlay);
        videoElement.addEventListener('ended', onVideoEnd);
        videoElement.addEventListener('error', onVideoError);
        
        console.log(`[Splash] Setting MAX DURATION timeout (${duration}ms) for video playback.`);
        timeoutId = setTimeout(() => {
            console.log(`[Splash] Max video duration (${duration}ms) reached.`);
            completeAndFadeOut();
        }, duration); 
        
        return () => {
          console.log('[Splash] Cleanup for video effect: removing listeners, clearing timeout.');
          videoElement.removeEventListener('canplay', onCanPlay);
          videoElement.removeEventListener('ended', onVideoEnd);
          videoElement.removeEventListener('error', onVideoError);
          if (timeoutId) clearTimeout(timeoutId);
        };
      } else {
        console.warn('[Splash] Video mode, but videoRef.current is null. Calling onComplete as safety.');
        onComplete(); 
        return;
      }
    } else if (mode === 'image') {
      console.log('[Splash] Image mode processing. Image URL:', url);
      if (!url) {
        console.error('[Splash] Image mode but no URL. Fallback should have provided one! Calling onComplete.');
        onComplete();
        return;
      }
      console.log(`[Splash] Setting DURATION timeout (${duration}ms) for image display.`);
      timeoutId = setTimeout(completeAndFadeOut, duration);
    } else {
      console.error('[Splash] UNEXPECTED: No valid effective mode. Calling onComplete.', effectiveMedia);
      onComplete(); 
      return;
    }

    let soundTimeoutId: NodeJS.Timeout | undefined = undefined;
    if (audioUrl && audioRef.current) {
      console.log('[Splash] Sound URL present. Attempting to play sound:', audioUrl);
      const audioElement = audioRef.current;
      audioElement.src = audioUrl;
      audioElement.play().catch(err => console.warn("[Splash] Audio autoplay failed for soundUrl:", err));
      
      soundTimeoutId = setTimeout(() => {
         if(audioElement && !audioElement.paused) {
           console.log('[Splash] Sound duration timeout reached, pausing audio.');
           audioElement.pause();
           audioElement.currentTime = 0; 
         }
       }, duration); 
    } else if (audioUrl && !audioRef.current) {
        console.warn('[Splash] Sound URL present, but audioRef.current is null.');
    }

    return () => {
      console.log('[Splash] Cleanup for main playback/display effect (clearing primary timeout and sound timeout).');
      if (timeoutId) clearTimeout(timeoutId);
      if (soundTimeoutId) clearTimeout(soundTimeoutId);
    };
  }, [effectiveMedia, onComplete]);

  if (!effectiveMedia) { 
    console.log('[Splash] Render: Effective media not ready. Rendering null (blank screen / waiting).');
    return null; 
  }
  
  console.log('[Splash] Render: Rendering splash screen elements with effective media:', effectiveMedia);
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
        />
      )}
      {effectiveMedia.mode === 'image' && effectiveMedia.url && (
        <img 
          src={effectiveMedia.url} 
          alt="Splash Screen" 
          style={mediaStyle}
          onError={(e) => {
            console.error('[Splash] Error loading main splash image:', effectiveMedia.url, e);
            (e.target as HTMLImageElement).src = FALLBACK_IMAGE_URL; 
            (e.target as HTMLImageElement).alt = "Default Fallback Splash Image";
            (e.target as HTMLImageElement).style.objectFit = 'contain';
          }}
        />
      )}
      {effectiveMedia.logoUrl && (
        <img 
          src={effectiveMedia.logoUrl} 
          alt="Logo Overlay" 
          style={commonOverlayStyles}
          onError={(e) => {
            console.warn('[Splash] Error loading overlay logo:', effectiveMedia.logoUrl, e);
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}
      {effectiveMedia.audioUrl && <audio ref={audioRef} />} 
    </div>
  );
};

export default SplashScreen;
