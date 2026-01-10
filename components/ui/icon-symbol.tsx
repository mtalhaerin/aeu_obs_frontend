// Fallback for using MaterialIcons on Android and web.

import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>['name']>;

const MAPPING = {
  'house.fill': { type: 'material', name: 'home' },
  'paperplane.fill': { type: 'material', name: 'send' },
  'chevron.left.forwardslash.chevron.right': { type: 'material', name: 'code' },
  'chevron.right': { type: 'material', name: 'chevron-right' },
  'chevron.down': { type: 'material', name: 'keyboard-arrow-down' },
  'chevron.up': { type: 'material', name: 'keyboard-arrow-up' },
  'sun': { type: 'feather', name: 'sun' },
  'moon': { type: 'feather', name: 'moon' },
  'log-out': { type: 'feather', name: 'log-out' },
} as const;

type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const icon = MAPPING[name];
  if (!icon) return null;
  if (icon.type === 'feather') {
    return <Feather name={icon.name} size={size} color={color as string} style={style} />;
  }
  return <MaterialIcons color={color} size={size} name={icon.name} style={style} />;
}
