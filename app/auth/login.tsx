import { LoginTexts } from '@/components/texts/login-texts';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import appConfig from '../../app.json';


interface LoginProps {
  onLogin: (userType: 'student' | 'other', username: string, password: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [userType, setUserType] = useState<'student' | 'other'>('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const styles = themedStyles('light');

  // JWT token örneği, gerçek uygulamada bunu güvenli şekilde alın
  const jwtToken = 'YOUR_JWT_TOKEN_HERE';

  // Store token in memory for demo; use secure storage in production
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Get API base URL from app.json (expo config)
  const API_BASE_URL = appConfig?.expo?.apiBaseUrl || 'http://localhost:5249/api';

  // Helper to get token for future requests
  const getAuthHeaders = () => {
    // Try to get from state, fallback to localStorage
    const token = accessToken || (typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem('accessToken') : null);
    if (token) {
      return {
        'Authorization': `Bearer ${token}`,
      };
    }
    return {};
  };

  const handleLoginPress = async () => {
    try {
      // If username or password is empty, send null as in the curl example
      const body = {
        email: username || null,
        password: password || null,
      };
      const response = await fetch(`${API_BASE_URL}/Auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (response.status === 200) {
        const data = await response.json();
        if (data?.data?.accessToken) {
          setAccessToken(data.data.accessToken);
          // Store in localStorage for persistence
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem('accessToken', data.data.accessToken);
          }
        }
        console.log('Login successful: ', data);
        onLogin(userType, username, password);
      } else {
        console.log('Login failed');
      }
    } catch (e) {
      console.log('Error during login: ', e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{LoginTexts.title}</Text>
      <View style={styles.switchContainer}>
        <TouchableOpacity
          style={[styles.switchButton, userType === 'student' && styles.switchButtonActive]}
          onPress={() => setUserType('student')}
        >
          <Text style={styles.switchText}>{LoginTexts.student}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.switchButton, userType === 'other' && styles.switchButtonActive]}
          onPress={() => setUserType('other')}
        >
          <Text style={styles.switchText}>{LoginTexts.other}</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        placeholder={userType === 'student' ? LoginTexts.studentPlaceholder : LoginTexts.otherPlaceholder}
        placeholderTextColor={'#666'}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder={LoginTexts.password}
        placeholderTextColor={'#666'}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLoginPress}
      >
        <Text style={styles.loginButtonText}>{LoginTexts.login}</Text>
      </TouchableOpacity>
    </View>
  );
};

const themedStyles = (_theme: 'light') =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff',
      padding: 24,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#181818',
      marginBottom: 32,
    },
    switchContainer: {
      flexDirection: 'row',
      marginBottom: 24,
      backgroundColor: '#eee',
      borderRadius: 8,
      overflow: 'hidden',
    },
    switchButton: {
      paddingVertical: 10,
      paddingHorizontal: 24,
      backgroundColor: 'transparent',
    },
    switchButtonActive: {
      backgroundColor: '#ddd',
    },
    switchText: {
      color: '#181818',
      fontWeight: '600',
      fontSize: 16,
    },
    input: {
      width: Platform.OS === 'web' ? 320 : '80%',
      padding: 12,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      backgroundColor: '#fafafa',
      color: '#181818',
      fontSize: 16,
    },
    loginButton: {
      marginTop: 24,
      backgroundColor: '#181818',
      paddingVertical: 14,
      paddingHorizontal: 48,
      borderRadius: 8,
      alignItems: 'center',
    },
    loginButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 18,
    },
  });

export default Login;
