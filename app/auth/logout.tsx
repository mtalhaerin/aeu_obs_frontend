import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface LogoutProps {
  onLogout: () => void;
}

const Logout: React.FC<LogoutProps> = ({ onLogout }) => {
  const styles = themedStyles('light');
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Çıkış Yap</Text>
      <TouchableOpacity style={styles.button} onPress={onLogout}>
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
