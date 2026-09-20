import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
export default function TabLayout() { const colors = useColors(); const insets = useSafeAreaInsets(); const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8); return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: "#0c6b58", tabBarInactiveTintColor: "#8aa097", tabBarButton: HapticTab, tabBarStyle: { paddingTop: 7, paddingBottom: bottomPadding, height: 58 + bottomPadding, backgroundColor: colors.background, borderTopColor: "#e1ebe4" } }}><Tabs.Screen name="index" options={{ title: "الرئيسية", tabBarIcon: ({ color }) => <IconSymbol name="house.fill" size={24} color={color} /> }} /><Tabs.Screen name="calendar" options={{ title: "التقويم", tabBarIcon: ({ color }) => <IconSymbol name={"calendar" as any} size={24} color={color} /> }} /><Tabs.Screen name="qibla" options={{ title: "القبلة", tabBarIcon: ({ color }) => <IconSymbol name={"explore" as any} size={24} color={color} /> }} /><Tabs.Screen name="settings" options={{ title: "الإعدادات", tabBarIcon: ({ color }) => <IconSymbol name="gearshape.fill" size={24} color={color} /> }} /></Tabs>; }
