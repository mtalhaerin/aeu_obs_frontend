import React from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '../ui/icon-symbol';

interface ThemeSelectorProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ theme, setTheme }) => {
  const nextTheme = theme === 'light' ? 'dark' : 'light';
  const iconName = theme === 'dark' ? 'moon' : 'sun';
  return (
    <View style={{ position: 'absolute', top: Platform.OS === 'web' ? 20 : 36, right: 16, zIndex: 10 }}>
      <TouchableOpacity
        onPress={() => setTheme(nextTheme)}
        style={{
          backgroundColor: 'transparent',
          borderRadius: 16,
          padding: 2,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IconSymbol name={iconName} size={22} color={theme === 'dark' ? '#fff' : '#181818'} />
      </TouchableOpacity>
    </View>
  );
};
