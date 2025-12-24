import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Loading from '../../components/loading';
import NavigationBar from '../../components/navigation-bar';
import { getCookie } from '../../utils/cookies';
import { ROUTES } from '../router';

const Dashboard: React.FC = () => {
  const router = useRouter();

  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Delay navigation slightly to avoid "navigate before mounting" errors
    const t = setTimeout(() => {
      const token = getCookie('accessToken');
      if (!token) {
        router.replace(ROUTES.LOGIN as any);
      } else {
        setIsChecking(false);
      }
    }, 100);
    return () => clearTimeout(t);
  }, [router]);

  if (isChecking) {
    return (
      <View style={styles.container}>
        <Loading text="Yükleniyor..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NavigationBar userName="Kullanıcı" />
      <View style={styles.content}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Hoş geldiniz!</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#181818',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
});

export default Dashboard;
