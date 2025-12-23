import { LoginTexts } from '@/components/texts/login-texts';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';


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

  const handleLoginPress = async () => {
    try {
      const response = await fetch('http://localhost:5249/api/Auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ email: username, password }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Login successful: ', data);
        // Başarılı giriş işlemi
        onLogin(userType, username, password);
      } else {
        console.log('Login failed');
        // Başarısız giriş işlemi
      }
    } catch (e) {
      console.log('Error during login: ', e);
      // Sunucu hatası işlemi
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
