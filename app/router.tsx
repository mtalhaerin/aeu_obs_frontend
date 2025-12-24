import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Button, Text, View } from 'react-native';
import SecureHeader from '../components/secure-header';
import { RouterTexts } from '../components/texts/router-texts';
import ChangePassword from './auth/change-password';
import Logout from './auth/logout';
import Profile from './profile';

const PublicScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 24 }}>{RouterTexts.publicScreen}</Text>
  </View>
);

const PrivateScreen = ({ navigation }: { navigation: any }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 24 }}>{RouterTexts.privateScreen}</Text>
    <Button title="Şifre Değiştir" onPress={() => navigation.navigate('ChangePassword')} />
  </View>
);

const Stack = createNativeStackNavigator();


type RouterProps = {
  hasAuthorizationToken: boolean;
  initialRouteName?: string;
};

const Router: React.FC<RouterProps> = ({ hasAuthorizationToken, initialRouteName }) => {
  return (
    <Stack.Navigator initialRouteName={initialRouteName}>
      {hasAuthorizationToken ? (
        <>
          <Stack.Screen
            name="Profile"
            component={Profile}
            options={{
              headerRight: () => <SecureHeader />,
              title: 'Profil',
            }}
          />
          <Stack.Screen
            name="ChangePassword"
            component={ChangePassword}
            options={{
              headerRight: () => <SecureHeader />,
              title: 'Şifre Değiştir',
            }}
          />
          <Stack.Screen
            name="Logout"
            component={Logout}
            options={{
              headerShown: false,
            }}
          />
        </>
      ) : (
        <Stack.Screen name="Public" component={PublicScreen} />
      )}
    </Stack.Navigator>
  );
};

export default Router;

// Route constants
export const ROUTES = {
  INDEX: '/',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  FORGOT_PASSWORD: '/auth/forgot-password',
  CHANGE_PASSWORD: '/auth/change-password',
  VERIFY_EMAIL: '/auth/verify-email',
  DASHBOARD: '/dashboard/dashboard',
  PROFILE: '/profile',
} as const;
