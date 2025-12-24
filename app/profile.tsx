import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import NavigationBar from '../components/navigation-bar';

const Profile: React.FC = () => {
  return (
    <View style={styles.container}>
      <NavigationBar userName="Kullanıcı" />
      <View style={styles.content}>
        <Text style={styles.title}>Profil Sayfası</Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#181818',
  },
});

export default Profile;
