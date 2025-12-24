import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { getCookie } from '../utils/cookies';
import { ROUTES } from './router';


const Index: React.FC = () => {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Router'ın hazır olmasını bekle
    const timer = setTimeout(() => {
      setIsReady(true);
      const token = getCookie('accessToken');
      if (token) {
        router.replace(ROUTES.DASHBOARD);
      } else {
        router.replace(ROUTES.LOGIN);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
};

export default Index;
