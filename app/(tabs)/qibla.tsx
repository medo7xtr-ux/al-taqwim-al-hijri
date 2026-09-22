import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useDeviceHeading } from "@/hooks/use-device-heading";
import { usePrayerSettings } from "@/lib/prayer-settings";
import { useThemeContext } from "@/lib/theme-provider";
import { bearingLabel, calculateDistanceToKaaba, calculateQiblaBearing, getQiblaRotation } from "@/lib/qibla";

const green = "#0c6b58";
const gold = "#d9aa55";
const DEFAULT_LOCATION = { latitude: 15.3694, longitude: 44.191 };

export default function QiblaScreen() {
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [locationName, setLocationName] = useState("صنعاء، اليمن");
  const prayerSettings = usePrayerSettings();
  const { colorScheme } = useThemeContext();
  const english = prayerSettings.language === "en";
  const dark = colorScheme === "dark";
  const [loading, setLoading] = useState(false);
  const { heading, accuracy, available } = useDeviceHeading();

  const bearing = useMemo(() => calculateQiblaBearing(location.latitude, location.longitude), [location]);
  const distance = useMemo(() => calculateDistanceToKaaba(location.latitude, location.longitude), [location]);
  const rotation = getQiblaRotation(bearing, heading);
  const aligned = Math.abs(rotation > 180 ? rotation - 360 : rotation) <= 3;

  const updateLocation = async () => {
    setLoading(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(english ? "Location permission" : "إذن الموقع", english ? "Using Sana'a as the default location." : "سيتم استخدام صنعاء كموقع افتراضي.");
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const next = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      setLocation(next);
      const places = await Location.reverseGeocodeAsync(next);
      const place = places[0];
      setLocationName([place?.city, place?.country].filter(Boolean).join("، ") || "موقعك الحالي");
    } catch {
      Alert.alert(english ? "Unable to update location" : "تعذر تحديث الموقع", english ? "Sana'a remains selected." : "ستبقى صنعاء هي الموقع المحدد.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]} containerClassName={dark ? "bg-[#10221d]" : "bg-[#f4f7f3]"} className="px-5">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.kicker}>{english ? "HIJRI • QIBLA" : "هجري • اتجاه القبلة"}</Text>
            <Text style={[styles.title, dark && styles.darkText]}>{english ? "Qibla Compass" : "بوصلة القبلة"}</Text>
          </View>
          <Pressable onPress={() => prayerSettings.setLanguage(english ? "ar" : "en")} style={styles.languageButton}>
            <Text style={styles.languageText}>{english ? "عربي" : "EN"}</Text>
          </Pressable>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}><IconSymbol name={"explore" as any} size={23} color={gold} /></View>
          <View style={styles.infoCopy}>
            <Text style={styles.infoTitle}>{english ? "Face the Kaaba" : "اتجه نحو الكعبة"}</Text>
            <Text style={styles.infoText}>{english ? "Move your phone in a figure eight to calibrate the compass." : "حرّك الهاتف على شكل رقم 8 لمعايرة البوصلة عند الحاجة."}</Text>
          </View>
        </View>

        <View style={styles.compassShell}>
          <View style={styles.compass}>
            <Text style={[styles.direction, styles.north]}>N</Text>
            <Text style={[styles.direction, styles.east]}>E</Text>
            <Text style={[styles.direction, styles.south]}>S</Text>
            <Text style={[styles.direction, styles.west]}>W</Text>
            <View style={styles.crosshairVertical} />
            <View style={styles.crosshairHorizontal} />
            <View style={[styles.needle, { transform: [{ rotate: `${rotation}deg` }] }]}>
              <View style={styles.needleTriangle} />
              <View style={styles.needleTail} />
              <View style={styles.needleCenter} />
            </View>
            <View style={styles.centerBadge}><IconSymbol name={"mosque" as any} size={25} color={gold} /></View>
          </View>
        </View>

        <View style={[styles.readingRow, dark && styles.darkSurface]}>
          <View style={styles.reading}><Text style={styles.readingValue}>{Math.round(bearing)}°</Text><Text style={[styles.readingLabel, dark && styles.darkMuted]}>{english ? "Qibla bearing" : "زاوية القبلة"}</Text></View>
          <View style={styles.divider} />
          <View style={styles.reading}><Text style={styles.readingValue}>{Math.round(distance).toLocaleString()} km</Text><Text style={[styles.readingLabel, dark && styles.darkMuted]}>{english ? "To Makkah" : "إلى مكة"}</Text></View>
        </View>

        <View style={[styles.status, aligned && styles.statusAligned]}>
          <View style={[styles.statusDot, aligned && styles.statusDotAligned]} />
          <Text style={[styles.statusText, aligned && styles.statusTextAligned]}>{aligned ? (english ? "You are facing the Qibla" : "أنت تواجه القبلة") : available ? (english ? `Turn ${bearingLabel(rotation, true)}` : `حرّك الهاتف نحو ${bearingLabel(rotation)}`) : (english ? "Compass unavailable — use the bearing" : "البوصلة غير متاحة — استخدم زاوية القبلة")}</Text>
          {accuracy !== null && <Text style={styles.accuracy}>{english ? `Accuracy ${accuracy}` : `الدقة ${accuracy}`}</Text>}
        </View>

        <Pressable onPress={updateLocation} style={({ pressed }) => [styles.locationButton, dark && styles.darkSurface, pressed && styles.pressed]}>
          {loading ? <ActivityIndicator color={green} /> : <IconSymbol name={"my-location" as any} size={19} color={green} />}
          <Text style={styles.locationButtonText}>{locationName}</Text>
          <IconSymbol name={"refresh" as any} size={18} color={green} />
        </Pressable>
        {Platform.OS === "web" && <Text style={styles.webNote}>{english ? "Live compass is available on Android; this preview shows the calculated bearing." : "البوصلة الحية متاحة على Android؛ المعاينة تعرض زاوية القبلة المحسوبة."}</Text>}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 18, paddingBottom: 35 }, darkText: { color: "#eaf5ed" }, darkMuted: { color: "#a7bcb1" }, darkSurface: { backgroundColor: "#1c362d", borderColor: "#315446" }, headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, kicker: { color: "#789087", fontSize: 11, letterSpacing: 1.1, fontWeight: "800" }, title: { color: green, fontSize: 29, fontWeight: "800", marginTop: 4 }, languageButton: { backgroundColor: "#e5eee8", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 }, languageText: { color: green, fontWeight: "800", fontSize: 12 }, infoCard: { flexDirection: "row", alignItems: "center", marginTop: 20, backgroundColor: "#e8f1ea", borderRadius: 18, padding: 14 }, infoIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: green, alignItems: "center", justifyContent: "center" }, infoCopy: { flex: 1, marginLeft: 12 }, infoTitle: { color: "#20483c", fontWeight: "800", fontSize: 14 }, infoText: { color: "#71877d", fontSize: 11, lineHeight: 17, marginTop: 4 }, compassShell: { alignItems: "center", marginTop: 28 }, compass: { width: 286, height: 286, borderRadius: 143, backgroundColor: "#fff", borderWidth: 10, borderColor: green, alignItems: "center", justifyContent: "center", shadowColor: "#0c6b58", shadowOpacity: 0.12, shadowRadius: 16, elevation: 4, position: "relative" }, direction: { position: "absolute", color: "#56766a", fontWeight: "900", fontSize: 15 }, north: { top: 17 }, east: { right: 21 }, south: { bottom: 17 }, west: { left: 21 }, crosshairVertical: { position: "absolute", height: 220, width: 1, backgroundColor: "#e3ebe5" }, crosshairHorizontal: { position: "absolute", width: 220, height: 1, backgroundColor: "#e3ebe5" }, needle: { width: 80, height: 190, alignItems: "center", justifyContent: "flex-start" }, needleTriangle: { width: 0, height: 0, borderLeftWidth: 22, borderRightWidth: 22, borderBottomWidth: 80, borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomColor: gold }, needleTail: { width: 12, height: 80, backgroundColor: green, marginTop: -1, borderRadius: 6 }, needleCenter: { position: "absolute", bottom: 77, width: 20, height: 20, borderRadius: 10, backgroundColor: "#fff", borderWidth: 5, borderColor: green }, centerBadge: { position: "absolute", width: 54, height: 54, borderRadius: 27, backgroundColor: green, alignItems: "center", justifyContent: "center" }, readingRow: { marginTop: 22, backgroundColor: "#fff", borderRadius: 18, borderWidth: 1, borderColor: "#e1ebe4", flexDirection: "row", alignItems: "center", paddingVertical: 14 }, reading: { flex: 1, alignItems: "center" }, readingValue: { color: green, fontSize: 21, fontWeight: "900" }, readingLabel: { color: "#8a9d94", fontSize: 11, marginTop: 3 }, divider: { width: 1, height: 35, backgroundColor: "#e4ece6" }, status: { marginTop: 14, backgroundColor: "#fff8e8", borderRadius: 14, padding: 12, flexDirection: "row", alignItems: "center" }, statusAligned: { backgroundColor: "#e5f2e8" }, statusDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: gold, marginRight: 8 }, statusDotAligned: { backgroundColor: green }, statusText: { color: "#906c2d", fontSize: 12, fontWeight: "700", flex: 1 }, statusTextAligned: { color: green }, accuracy: { color: "#8a9d94", fontSize: 10 }, locationButton: { marginTop: 14, backgroundColor: "#e6f0e8", borderRadius: 15, padding: 14, flexDirection: "row", alignItems: "center", gap: 9 }, pressed: { opacity: 0.72 }, locationButtonText: { color: green, fontWeight: "800", fontSize: 13, flex: 1 }, webNote: { color: "#8b9d94", textAlign: "center", fontSize: 11, lineHeight: 17, marginTop: 14 },
});
