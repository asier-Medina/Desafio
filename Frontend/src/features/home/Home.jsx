import { useState } from 'react';
import SplashScreen from './SplashScreen';
import HomeLanding from './HomeLanding';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }
  return <HomeLanding />;
}
