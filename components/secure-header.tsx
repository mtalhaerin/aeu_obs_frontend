import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from './ui/icon-symbol';

const SecureHeader: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile' as never)}>
        <Icon name="user" size={24} />
        <Text style={styles.text}>Profil</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.navigate('Logout' as never)}>
        <Text style={styles.text}>Çıkış</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 10,
    height: 44,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  logoutButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginLeft: 4,
    fontSize: 16,
  },
});

export default SecureHeader;
