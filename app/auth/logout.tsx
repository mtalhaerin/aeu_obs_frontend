import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import appConfig from '../../app.json';
import { ROUTES } from '../router';

interface LogoutProps {
  onLogout?: () => {};
}

const Logout: React.FC<LogoutProps> = ({ onLogout }) => {
  const styles = themedStyles('light');

  // Default onLogout: redirect to login
  const handleOnLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      router.replace(ROUTES.LOGIN as any);
    }
  };

  // Get API base URL from app.json (expo config)
  const API_BASE_URL = appConfig?.expo?.apiBaseUrl || 'http://localhost:5249/api';

  // Helper to get token from localStorage
  const getAccessToken = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem('accessToken');
    }
    return null;
  };

  const handleLogout = async () => {
    const token = getAccessToken();
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
    // Only remove token if logout was successful
    if (success && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('accessToken');
    }
    handleOnLogout();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Çıkış Yap</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Çıkış</Text>
      </TouchableOpacity>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#181818',
    marginBottom: 32,
  },
  button: {
    marginTop: 24,
    backgroundColor: '#181818',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Logout;
