import '../styles/globals.css';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  return (
    <>
      <Head>
        <title>Gumasta Krishi Kendra</title>
        <meta name="description" content="Inventory and Sales Management System for Gumasta Krishi Kendra" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="spinner h-12 w-12"></div>
        </div>
      )}

      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
