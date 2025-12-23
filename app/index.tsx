import React, { useState } from 'react';
import { View } from 'react-native';

import Login from './auth/login';
import Router from './router';

const Index: React.FC = () => {
  const [hasToken, setHasToken] = useState(false);

  const handleLogin = (userType: 'student' | 'other', username: string, password: string) => {
    setHasToken(true);
  };

  return (
    <>
      <View style={{ flex: 1 }}>
        {!hasToken ? (
          <Login onLogin={handleLogin} />
        ) : (
          <Router hasAuthorizationToken={hasToken} />
        )}
      </View>
    </>
  );
};

export default Index;
