import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

// Dummy screens for demonstration
import { Button, Text, View } from 'react-native';
import { RouterTexts } from '../components/texts/router-texts';
import ChangePassword from './auth/change-password';

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
};

const Router: React.FC<RouterProps> = ({ hasAuthorizationToken }) => {
  return (
    <Stack.Navigator>
      {hasAuthorizationToken ? (
        <>
          <Stack.Screen name="Private" component={PrivateScreen} />
          <Stack.Screen name="ChangePassword" component={ChangePassword} />
        </>
      ) : (
        <Stack.Screen name="Public" component={PublicScreen} />
      )}
    </Stack.Navigator>
  );
};

export default Router;
