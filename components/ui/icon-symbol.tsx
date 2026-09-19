import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;
const MAPPING = {
  "house.fill": "home", "calendar": "calendar-today", "gearshape.fill": "settings", "settings": "settings", "language": "language", "dark-mode": "dark-mode", "notifications-active": "notifications-active", "volume-up": "volume-up", "location-on": "location-on", "location.fill": "location-on", "near-me": "near-me", "my-location": "my-location", "bell.fill": "notifications-active", "bell.slash.fill": "notifications-off", "notifications-none": "notifications-none", "chevron.left": "chevron-left", "chevron.right": "chevron-right", "chevron-left": "chevron-left", "chevron-right": "chevron-right", "auto-awesome": "auto-awesome", "wb-twilight": "wb-twilight", "wb-sunny": "wb-sunny", "light-mode": "light-mode", "wb-cloudy": "wb-cloudy", "brightness-3": "brightness-3", "nights-stay": "nights-stay", "code": "code", "paperplane.fill": "send", "chevron.right.forwardslash.chevron.left": "code",
} as unknown as IconMapping;
export function IconSymbol({ name, size = 24, color, style }: { name: IconSymbolName; size?: number; color: string | OpaqueColorValue; style?: StyleProp<TextStyle>; weight?: SymbolWeight }) { return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />; }
