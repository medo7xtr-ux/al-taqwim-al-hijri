import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { gregorianToHijri, hijriLabel } from "@/lib/prayer";
import { usePrayerSettings } from "@/lib/prayer-settings";
import { useThemeContext } from "@/lib/theme-provider";

const green = "#0c6b58"; const gold = "#d9aa55";
const monthAr = ["", "المحرّم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوّال", "ذو القعدة", "ذو الحجة"];
const monthEn = ["", "Muharram", "Safar", "Rabi al-Awwal", "Rabi al-Thani", "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"];

export default function CalendarScreen() {
  const prayerSettings = usePrayerSettings();
  const { colorScheme } = useThemeContext();
  const english = prayerSettings.language === "en";
  const dark = colorScheme === "dark";
  const [offset, setOffset] = useState(0);
  const selected = useMemo(() => { const d = new Date(); d.setDate(d.getDate() + offset); return d; }, [offset]);
  const h = gregorianToHijri(selected);
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  return <ScreenContainer containerClassName={dark ? "bg-[#10221d]" : "bg-[#f4f7f3]"} className="px-5"><ScrollView contentContainerStyle={styles.content}>
    <View style={styles.header}><Text style={[styles.title, dark && styles.darkText]}>{english ? "Hijri Calendar" : "التقويم الهجري"}</Text><Pressable onPress={() => prayerSettings.setLanguage(english ? "ar" : "en")}><Text style={styles.lang}>{english ? "العربية" : "EN"}</Text></Pressable></View>
    <View style={styles.card}><Text style={styles.month}>{english ? monthEn[h.month] : monthAr[h.month]}</Text><Text style={styles.year}>{h.year} AH</Text><Text style={styles.greg}>{hijriLabel(selected, english)}</Text></View>
    <View style={styles.nav}><Pressable onPress={() => setOffset((v) => v - 1)} style={[styles.navBtn, dark && styles.darkSurface]}><IconSymbol name={"chevron-left" as any} size={22} color={green} /></Pressable><Text style={[styles.navText, dark && styles.darkText]}>{english ? (offset === 0 ? "Today" : "Selected day") : (offset === 0 ? "اليوم" : "اليوم المحدد")}</Text><Pressable onPress={() => setOffset((v) => v + 1)} style={[styles.navBtn, dark && styles.darkSurface]}><IconSymbol name={"chevron-right" as any} size={22} color={green} /></Pressable></View>
    <View style={styles.week}>{(english ? ["S", "M", "T", "W", "T", "F", "S"] : ["ح", "ن", "ث", "ر", "خ", "ج", "س"]).map((day, index) => <Text key={`${day}-${index}`} style={[styles.weekText, dark && styles.darkMuted]}>{day}</Text>)}</View>
    <View style={styles.grid}>{days.map((day) => <View key={day} style={[styles.day, dark && styles.darkSurface, day === h.day && styles.selected]}><Text style={[styles.dayText, dark && styles.darkText, day === h.day && styles.selectedText]}>{day}</Text><Text style={[styles.gregSmall, dark && styles.darkMuted, day === h.day && styles.selectedText]}>{(day + 8) % 30 + 1}</Text></View>)}</View>
    <View style={styles.note}><IconSymbol name={"auto-awesome" as any} size={20} color={gold} /><Text style={styles.noteText}>{english ? "Dates use the Umm al-Qura calendar and may vary by one day with local moon sighting." : "التاريخ وفق تقويم أم القرى، وقد يختلف يومًا حسب رؤية الهلال المحلية."}</Text></View>
  </ScrollView></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { paddingTop: 20, paddingBottom: 30 }, header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, title: { color: green, fontSize: 27, fontWeight: "800" }, darkText: { color: "#eaf5ed" }, darkMuted: { color: "#a7bcb1" }, lang: { color: green, fontWeight: "800", backgroundColor: "#e4efe7", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 15 }, card: { marginTop: 22, backgroundColor: green, borderRadius: 25, alignItems: "center", paddingVertical: 26 }, month: { color: "#fff", fontSize: 27, fontWeight: "800" }, year: { color: gold, fontSize: 16, fontWeight: "700", marginTop: 4 }, greg: { color: "#b9d4c7", marginTop: 11, fontSize: 12 }, nav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 18 }, navBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#e5eee8", alignItems: "center", justifyContent: "center" }, darkSurface: { backgroundColor: "#1c362d", borderColor: "#315446" }, navText: { color: "#264d41", fontWeight: "800" }, week: { flexDirection: "row", justifyContent: "space-around", marginBottom: 9 }, weekText: { color: "#8aa097", fontWeight: "700", width: "13.1%", textAlign: "center" }, grid: { flexDirection: "row", flexWrap: "wrap", gap: 7 }, day: { width: "13.1%", aspectRatio: 0.88, backgroundColor: "#fff", borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#e2ebe5" }, selected: { backgroundColor: green, borderColor: green }, dayText: { color: "#264d41", fontSize: 15, fontWeight: "800" }, gregSmall: { color: "#a2b0a9", fontSize: 9, marginTop: 3 }, selectedText: { color: "#fff" }, note: { flexDirection: "row", gap: 10, backgroundColor: "#fffaf0", padding: 15, borderRadius: 16, marginTop: 20, alignItems: "center" }, noteText: { flex: 1, color: "#8c754e", fontSize: 12, lineHeight: 18 } });
