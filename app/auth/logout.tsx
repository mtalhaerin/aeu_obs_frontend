import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import appConfig from '../../app.json';
import { deleteCookie, getCookie } from '../../utils/cookies';
import { ROUTES } from '../router';

const Logout: React.FC = () => {
  const styles = themedStyles('light');

  // Get API base URL from app.json (expo config)
  const API_BASE_URL = appConfig?.expo?.apiBaseUrl || 'http://localhost:5249/api';

  useEffect(() => {
    const performLogout = async () => {
      const token = getCookie('accessToken');
      let success = false;
      try {
        const response = await fetch(`${API_BASE_URL}/Auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
        });
        if (response.status === 200) {
          success = true;
        }
      } catch (e) {
        // Optionally handle error
      }
      
      // Temizleme işlemleri - logout başarılı olsun ya da olmasın temizle
      // Tüm cookie'leri temizle
      deleteCookie('accessToken');
      
      // LocalStorage'ı tamamen temizle
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
      
      // SessionStorage'ı da temizle
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.clear();
      }
      
      // Login'e yönlendir
      router.replace(ROUTES.LOGIN);
    };

    performLogout();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#181818" />
      <Text style={styles.title}>Çıkış yapılıyor...</Text>
    </View>
  );
};

const themedStyles = (_theme: 'light') => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  title: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
});

export default Logout;
