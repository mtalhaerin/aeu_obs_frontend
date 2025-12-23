import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface VerifyEmailProps {}

const VerifyEmail: React.FC<VerifyEmailProps> = () => {
  const [code, setCode] = useState('');
  const styles = themedStyles('light');
  return (
    <View style={styles.container}>
      <Text style={styles.title}>E-posta Doğrulama</Text>
      <TextInput
        style={styles.input}
        placeholder="Doğrulama Kodu"
        placeholderTextColor= '#666'
        value={code}
        onChangeText={setCode}
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Doğrula</Text>
      </TouchableOpacity>
    </View>
  );
};

const themedStyles = (theme: 'light' | 'dark') => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme === 'dark' ? '#181818' : '#fff',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme === 'dark' ? '#fff' : '#181818',
    marginBottom: 32,
  },
  input: {
    width: 320,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: theme === 'dark' ? '#444' : '#ccc',
    borderRadius: 8,
    backgroundColor: theme === 'dark' ? '#222' : '#fafafa',
    color: theme === 'dark' ? '#fff' : '#181818',
    fontSize: 16,
  },
  button: {
    marginTop: 24,
    backgroundColor: theme === 'dark' ? '#007AFF' : '#181818',
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

export default VerifyEmail;
