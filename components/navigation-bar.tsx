import { useRouter } from 'expo-router';
import React, { useState } from 'react';
// ImageSourcePropType'ı import ediyoruz
import { Image, ImageSourcePropType, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { ROUTES } from '../app/router';
import { IconSymbol } from './ui/icon-symbol';

// 1. ÖNEMLİ: Dosyayı require ile alıyoruz.
// NavigationBar.tsx dosyasının konumuna göre '../app/...' yolunu kontrol edin.
// Eğer dosya yapınız: root -> components -> NavigationBar.tsx ise bu yol doğrudur.
// const DEFAULT_LOGO = require('../app/assets/images/favicon.svg');

interface NavigationBarProps {
  userName?: string;
  /** Logo kaynağı: String URL veya require edilmiş asset. */
  logoSrc?: string | ImageSourcePropType;
}

// Default to the local favicon used elsewhere (Login/Loading)
const defaultLogo = require('../assets/images/favicon.png');

const NavigationBar: React.FC<NavigationBarProps> = ({ userName = 'Kullanıcı', logoSrc = defaultLogo }) => {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [logoLoadFailed, setLogoLoadFailed] = useState(false);

  // 2. Asset kaynağını Web için string URL'e çeviren yardımcı fonksiyon
  const getImgSrc = (source: string | ImageSourcePropType): string => {
    if (typeof source === 'string') return source;
    try {
      const resolver = (Image as any).resolveAssetSource;
      const resolved = typeof resolver === 'function' ? resolver(source) : null;
      return resolved?.uri ?? (source as any)?.uri ?? (source as any)?.default ?? '';
    } catch (_e) {
      return (source as any)?.uri ?? (source as any)?.default ?? '';
    }
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleProfileNavigate = () => {
    setIsDropdownOpen(false);
    router.push(ROUTES.PROFILE);
  };

  const handleLogout = () => {
    router.push(ROUTES.LOGOUT);
  };

  // Web etiketi için çözümlenmiş kaynak URL'i
  const resolvedSrc = getImgSrc(logoSrc);
  
  // SVG kontrolü (URL string ise uzantıdan, require ise uri içinden kontrol)
  const isSvg = resolvedSrc.toLowerCase().endsWith('.svg') || resolvedSrc.includes('svg');

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {!logoLoadFailed && logoSrc ? (
          Platform.OS === 'web' && isSvg ? (
            // 3. Web tarafında SVG için native <img> etiketi
            // src kısmına resolvedSrc (string URL) veriyoruz
            // @ts-ignore
            <img
              src={resolvedSrc}
              className="nav-logo"
              alt="AEU OBS logo"
              title="AEU OBS"
              onError={() => setLogoLoadFailed(true)}
              // Inline fallback: make the web <img> match RN size (80x80)
              style={{ width: '3em', height: '3em', objectFit: 'contain', display: 'inline-block' }}
            />
          ) : (
            <Image
              // React Native Image bileşeni hem {uri: string} hem de require() kabul eder
              source={typeof logoSrc === 'string' ? { uri: logoSrc } : logoSrc}
              style={styles.logoImage}
              resizeMode="contain"
              onError={() => setLogoLoadFailed(true)}
            />
          )
        ) : (
          <Text style={styles.logo}>AEU OBS</Text>
        )}
      </View>
      
      {/* Sağ Kısım (Değişmedi) */}
      <View style={styles.rightSection}>
        <View style={styles.profileContainer}>
          <Pressable style={styles.profileButton} onPress={handleProfileClick}>
            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.dropdownArrow}>{isDropdownOpen ? '▲' : '▼'}</Text>
            <View style={styles.profileImage}>
              <Text style={styles.profileImageText}>{userName.charAt(0).toUpperCase()}</Text>
            </View>
          </Pressable>

          {isDropdownOpen && (
            <View style={styles.dropdown}>
              <Pressable style={styles.dropdownItem} onPress={handleProfileNavigate}>
                <Text style={styles.dropdownText}>Profil</Text>
              </Pressable>
            </View>
          )}
        </View>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <IconSymbol name="log-out" size={20} color="#181818" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 12,
    // minHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  logo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#181818',
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileContainer: {
    position: 'relative',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    cursor: Platform.OS === 'web' ? 'pointer' : undefined,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#181818',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#181818',
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#666',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 150,
    zIndex: 1001,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    cursor: Platform.OS === 'web' ? 'pointer' : undefined,
  },
  dropdownText: {
    fontSize: 14,
    color: '#181818',
    fontWeight: '500',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: Platform.OS === 'web' ? 'pointer' : undefined,
  },
});

export default NavigationBar;