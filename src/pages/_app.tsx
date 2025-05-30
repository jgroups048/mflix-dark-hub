import { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import SplashScreen from '@/components/SplashScreen'; // Adjust path if needed
import MainLayout from '@/components/layout/MainLayout'; // Assuming you have a MainLayout
import '@/styles/globals.css'; // Your global styles
import Head from 'next/head';
import { getSiteSettings } from '@/lib/firebaseServices/siteSettingsService';

function MyApp({ Component, pageProps }: AppProps) {
  const [loading, setLoading] = useState(true);
  const [faviconUrl, setFaviconUrl] = useState('/favicon.ico'); // Default favicon

  useEffect(() => {
    // Fetch site settings for favicon
    getSiteSettings().then(settings => {
      if (settings?.faviconUrl) {
        setFaviconUrl(settings.faviconUrl);
      }
    }).catch(error => {
      console.error("Error fetching favicon in _app.tsx:", error);
    });
  }, []);

  const handleSplashComplete = () => {
    setLoading(false);
  };

  // Potentially, check if splash should even run based on settings fetched here first,
  // or let SplashScreen handle it entirely as it does now.
  // For simplicity, current SplashScreen handles its own logic including sessionStorage and enabled flag.

  if (loading) {
    return (
      <>
        <Head>
          <link rel="icon" href={faviconUrl} />
          {/* You might want a generic title here or set it per page */}
          <title>Loading...</title> 
        </Head>
        <SplashScreen onComplete={handleSplashComplete} />
      </>
    );
  }

  return (
    <>
      <Head>
        <link rel="icon" href={faviconUrl} />
        {/* Per-page title will override this if set via Next/Head in a component */}
        {/* <title>Mflix Entertainment Hub</title> */}
      </Head>
      <MainLayout>
        <Component {...pageProps} />
      </MainLayout>
    </>
  );
}

export default MyApp; 