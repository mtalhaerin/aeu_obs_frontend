import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AdminSidePanel from '../components/admin-side-panel';
import Loading from '../components/loading';
import NavigationBar from '../components/navigation-bar';
import Addresses from '../components/profile/addresses';
import Emails from '../components/profile/emails';
import Phones from '../components/profile/phones';
import { IconSymbol } from '../components/ui/icon-symbol';
import { IdentityType } from '../constants/identity-types';
import { getCookie } from '../utils/cookies';
import { getIdentityTypeFromToken } from '../utils/jwt';
import { ROUTES } from './router';

const Profile: React.FC = () => {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [identityType, setIdentityType] = useState<IdentityType | null>(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      const token = getCookie('accessToken');
      if (!token) {
        router.replace(ROUTES.LOGIN as any);
      } else {
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

  const isAdmin = identityType === IdentityType.PERSONEL;

  return (
    <View style={styles.container}>
      <NavigationBar userName="Kullanıcı" />
      <View style={styles.mainContent}>
        {isAdmin && (
          <>
            <AdminSidePanel userName="Admin Kullanıcı" isCollapsed={isPanelCollapsed} />
            
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
        
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <Text style={styles.title}>Kişisel Bilgiler</Text>
          <Text style={styles.subtitle}>Adresleriniz, telefon numaralarınız ve e-posta adreslerinizi yönetin</Text>
          
          {identityType && (
            <Text style={styles.userType}>
              Yetkili Tür: {identityType}
            </Text>
          )}

          <View style={styles.sectionsContainer}>
            <Addresses />
            <Phones />
            <Emails />
          </View>
        </ScrollView>
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
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  sectionsContainer: {
    marginTop: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#181818',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  userType: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 24,
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
});

export default Profile;
