import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import AdminSidePanel from '../../components/admin-side-panel';
import Loading from '../../components/loading';
import NavigationBar from '../../components/navigation-bar';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { IdentityType } from '../../constants/identity-types';
import { getCookie } from '../../utils/cookies';
import { getIdentityTypeFromToken } from '../../utils/jwt';
import { ROUTES } from '../router';

const Dashboard: React.FC = () => {
  const router = useRouter();

  const [isChecking, setIsChecking] = useState(true);
  const [identityType, setIdentityType] = useState<IdentityType | null>(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  useEffect(() => {
    // Delay navigation slightly to avoid "navigate before mounting" errors
    const t = setTimeout(() => {
      const token = getCookie('accessToken');
      if (!token) {
        router.replace(ROUTES.LOGIN as any);
      } else {
        // JWT'den identity_type'ı oku
        const userIdentityType = getIdentityTypeFromToken(token);
        setIdentityType(userIdentityType);
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

  // PERSONEL için admin panel ile layout
  const isAdmin = identityType === IdentityType.PERSONEL;

  return (
    <View style={styles.container}>
      <NavigationBar userName="Kullanıcı" />
      <View style={styles.mainContent}>
        {/* Sadece PERSONEL için sol panel göster */}
        {isAdmin && (
          <>
            <AdminSidePanel userName="Admin Kullanıcı" isCollapsed={isPanelCollapsed} />
            
            {/* Toggle Button */}
            <Pressable
              style={[
                styles.toggleButton,
                isPanelCollapsed ? styles.toggleButtonCollapsed : styles.toggleButtonExpanded,
              ]}
              onPress={() => setIsPanelCollapsed(!isPanelCollapsed)}
            >
              <IconSymbol  name={isPanelCollapsed ? 'chevron.right' : 'chevron.down'}  size={18}  color="#666"/>
            </Pressable>
          </>
        )}
        
        <View style={styles.content}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Hoş geldiniz!</Text>
          {identityType && (
            <Text style={styles.userType}>
              Kullanıcı Türü: {identityType}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
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
    marginBottom: 8,
  },
  userType: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 16,
  },
  toggleButton: {
    position: 'absolute',
    top: 20,
    zIndex: 1000,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    cursor: Platform.OS === 'web' ? 'pointer' : undefined,
  },
  toggleButtonExpanded: {
    left: 268,
  },
  toggleButtonCollapsed: {
    left: 12,
  },
  toggleButtonText: {
    fontSize: 14,
    color: '#181818',
    fontWeight: 'bold',
  },
});

export default Dashboard;
