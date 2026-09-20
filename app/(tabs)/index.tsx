import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { calculatePrayers, hijriLabel, todayGregorianLabel, type Prayer } from "@/lib/prayer";
import { schedulePrayerAlerts } from "@/lib/notifications";

const green = "#0c6b58";
const gold = "#d9aa55";

export default function HomeScreen() {
  const router = useRouter();
  const [english, setEnglish] = useState(false);
  const [coords, setCoords] = useState({ latitude: 15.3694, longitude: 44.1910 });
  const [locationName, setLocationName] = useState("صنعاء، اليمن");
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState(true);
  const [sound, setSound] = useState(true);
  const [prayers, setPrayers] = useState<Prayer[]>(calculatePrayers(15.3694, 44.1910));
  const [now, setNow] = useState(new Date());

  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(timer); }, []);
  useEffect(() => { schedulePrayerAlerts(prayers, alerts, sound).catch(() => undefined); }, [prayers, alerts, sound]);
  const next = useMemo(() => { const current = now.getHours() * 60 + now.getMinutes(); return prayers.find((p) => { const [h, m] = p.time.split(":").map(Number); return h * 60 + m > current; }) ?? prayers[0]; }, [now, prayers]);

  const locate = async () => {
    setLoading(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") { Alert.alert(english ? "Location permission" : "إذن الموقع", english ? "Please allow location access in settings." : "يرجى السماح بالوصول إلى الموقع من الإعدادات."); return; }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const nextCoords = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      setCoords(nextCoords); setPrayers(calculatePrayers(nextCoords.latitude, nextCoords.longitude));
      const places = await Location.reverseGeocodeAsync(nextCoords);
      const place = places[0]; setLocationName([place?.city, place?.country].filter(Boolean).join("، ") || "موقعك الحالي");
    } catch { Alert.alert(english ? "Unable to locate" : "تعذر تحديد الموقع", english ? "Using the default location." : "سيتم استخدام الموقع الافتراضي."); }
    finally { setLoading(false); }
  };

  const requestAlerts = async () => {
    const permission = await Notifications.requestPermissionsAsync();
    if (permission.status !== "granted") { setAlerts(false); Alert.alert(english ? "Notifications disabled" : "التنبيهات متوقفة", english ? "Enable notifications to receive prayer alerts." : "فعّل التنبيهات لتلقي إشعارات الصلاة."); return; }
    setAlerts((value) => !value);
  };

  return <ScreenContainer edges={["top", "left", "right"]} containerClassName="bg-[#f4f7f3]" className="px-5">
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.topRow}><View><Text style={styles.kicker}>{english ? "HIJRI • PRAYER & CALENDAR" : "التقويم الهجري • مواقيت الصلاة"}</Text><Text style={styles.title}>{"Hijri"}</Text></View><Pressable onPress={() => router.push("/settings")} style={styles.iconButton}><IconSymbol name={"settings" as any} size={23} color={green} /></Pressable></View>
      <View style={styles.hero}><View style={styles.moon}><Text style={styles.moonText}>☾</Text></View><Text style={styles.hijri}>{hijriLabel(now, english)}</Text><Text style={styles.gregorian}>{todayGregorianLabel(english)}</Text><View style={styles.locationRow}><IconSymbol name={"location-on" as any} size={16} color={gold} /><Text style={styles.location}>{locationName}</Text><Pressable onPress={locate} style={styles.refresh}>{loading ? <ActivityIndicator size="small" color={green} /> : <IconSymbol name={"my-location" as any} size={16} color={green} />}</Pressable></View></View>
      <View style={styles.nextCard}><View><Text style={styles.nextLabel}>{english ? "NEXT PRAYER" : "الصلاة القادمة"}</Text><Text style={styles.nextName}>{english ? next.en : next.ar}</Text></View><Text style={styles.nextTime}>{next.time}</Text></View>
      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{english ? "Prayer times" : "مواقيت الصلاة"}</Text><Pressable onPress={() => router.push("/calendar")}><Text style={styles.link}>{english ? "Calendar" : "التقويم"}</Text></Pressable></View>
      <View style={styles.prayerGrid}>{prayers.map((prayer) => <View key={prayer.key} style={[styles.prayerCard, prayer.key === next.key && styles.activePrayer]}><IconSymbol name={prayer.icon as any} size={22} color={prayer.key === next.key ? gold : green} /><Text style={styles.prayerName}>{english ? prayer.en : prayer.ar}</Text><Text style={styles.prayerTime}>{prayer.time}</Text>{prayer.key !== "sunrise" && <View style={styles.dot}><IconSymbol name={"notifications-none" as any} size={12} color={prayer.key === next.key ? gold : "#9bb2a9"} /></View>}</View>)}</View>
      <View style={styles.quickRow}><Pressable style={styles.quickCard} onPress={locate}><IconSymbol name={"location.fill" as any} size={21} color={green} /><Text style={styles.quickText}>{english ? "Update location" : "تحديث الموقع"}</Text></Pressable><Pressable style={styles.quickCard} onPress={requestAlerts}><IconSymbol name={(alerts ? "bell.fill" : "bell.slash.fill") as any} size={21} color={alerts ? green : "#9aa7a0"} /><Text style={styles.quickText}>{alerts ? (english ? "Alerts on" : "التنبيهات مفعلة") : (english ? "Alerts off" : "التنبيهات متوقفة")}</Text></Pressable></View>
      <Pressable onPress={() => router.push("/qibla")} style={({ pressed }) => [styles.qiblaShortcut, pressed && { opacity: 0.75 }]}><View style={styles.qiblaShortcutIcon}><IconSymbol name={"explore" as any} size={21} color={gold} /></View><View style={styles.qiblaShortcutCopy}><Text style={styles.qiblaShortcutTitle}>{english ? "Find the Qibla" : "اعثر على اتجاه القبلة"}</Text><Text style={styles.qiblaShortcutSub}>{english ? "Open the live compass" : "افتح البوصلة التفاعلية"}</Text></View><IconSymbol name={"chevron.right" as any} size={20} color={green} /></Pressable>
      <Text style={styles.quote}>{english ? "Indeed, prayer has been decreed upon the believers at specified times." : "إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا"}</Text>
    </ScrollView>
  </ScreenContainer>;
}

const styles = StyleSheet.create({ content: { paddingTop: 18, paddingBottom: 28 }, topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, kicker: { color: "#789087", fontSize: 11, letterSpacing: 1.3, fontWeight: "700" }, title: { color: green, fontSize: 32, fontWeight: "800", marginTop: 2 }, iconButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#e5eee8", alignItems: "center", justifyContent: "center" }, hero: { marginTop: 22, alignItems: "center", backgroundColor: green, borderRadius: 28, paddingVertical: 24, overflow: "hidden" }, moon: { width: 58, height: 58, borderRadius: 29, backgroundColor: "#185f51", alignItems: "center", justifyContent: "center", marginBottom: 10 }, moonText: { color: gold, fontSize: 38, lineHeight: 42 }, hijri: { color: "#fff", fontSize: 23, fontWeight: "800" }, gregorian: { color: "#b9d4c7", fontSize: 13, marginTop: 6 }, locationRow: { flexDirection: "row", alignItems: "center", marginTop: 14, gap: 6 }, location: { color: "#e5f1eb", fontSize: 12 }, refresh: { marginLeft: 6, backgroundColor: "#dcebe1", width: 27, height: 27, borderRadius: 14, alignItems: "center", justifyContent: "center" }, nextCard: { marginTop: 14, backgroundColor: "#fff", borderRadius: 18, padding: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: "#e0ebe3" }, nextLabel: { color: "#82968d", fontSize: 10, fontWeight: "800", letterSpacing: 1 }, nextName: { color: green, fontSize: 22, fontWeight: "800", marginTop: 5 }, nextTime: { color: gold, fontSize: 30, fontWeight: "800" }, sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 25, marginBottom: 12 }, sectionTitle: { color: "#183d34", fontSize: 19, fontWeight: "800" }, link: { color: green, fontWeight: "700", fontSize: 13 }, prayerGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 }, prayerCard: { width: "31.7%", minHeight: 116, backgroundColor: "#fff", borderRadius: 17, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#e2ebe5", position: "relative" }, activePrayer: { backgroundColor: "#0c6b58", borderColor: green }, prayerName: { color: "#667d73", fontSize: 12, marginTop: 8 }, prayerTime: { color: "#183d34", fontSize: 17, fontWeight: "800", marginTop: 3 }, dot: { position: "absolute", right: 8, top: 8 }, quickRow: { flexDirection: "row", gap: 10, marginTop: 18 }, quickCard: { flex: 1, backgroundColor: "#e6f0e8", borderRadius: 15, padding: 13, flexDirection: "row", alignItems: "center", gap: 8 }, quickText: { color: green, fontSize: 12, fontWeight: "700" }, qiblaShortcut: { marginTop: 11, borderRadius: 16, backgroundColor: "#0c6b58", padding: 12, flexDirection: "row", alignItems: "center" }, qiblaShortcutIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#185f51", alignItems: "center", justifyContent: "center" }, qiblaShortcutCopy: { flex: 1, marginLeft: 10 }, qiblaShortcutTitle: { color: "#fff", fontSize: 13, fontWeight: "800" }, qiblaShortcutSub: { color: "#b9d4c7", fontSize: 10, marginTop: 3 }, quote: { textAlign: "center", color: "#8b9d94", fontSize: 12, lineHeight: 21, marginTop: 22, paddingHorizontal: 15 }, });
