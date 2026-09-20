import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { CALCULATION_METHODS, CITY_OPTIONS, usePrayerSettings } from "@/lib/prayer-settings";

const green = "#0c6b58";

type RowProps = { icon: any; title: string; subtitle?: string; right: React.ReactNode };
function Row({ icon, title, subtitle, right }: RowProps) { return <View style={styles.row}><View style={styles.rowIcon}><IconSymbol name={icon} size={21} color={green} /></View><View style={styles.rowCopy}><Text style={styles.rowTitle}>{title}</Text>{subtitle && <Text style={styles.rowSub}>{subtitle}</Text>}</View>{right}</View>; }

export default function SettingsScreen() {
  const [english, setEnglish] = useState(false);
  const [dark, setDark] = useState(false);
  const [alerts, setAlerts] = useState(true);
  const [sound, setSound] = useState(true);
  const [showCities, setShowCities] = useState(false);
  const [showMethods, setShowMethods] = useState(false);
  const prayerSettings = usePrayerSettings();
  const selectedMethod = CALCULATION_METHODS.find((item) => item.id === prayerSettings.method) ?? CALCULATION_METHODS[0];

  return <ScreenContainer containerClassName={dark ? "bg-[#10221d]" : "bg-[#f4f7f3]"} className="px-5"><ScrollView contentContainerStyle={styles.content}>
    <Text style={[styles.title, dark && styles.darkText]}>{english ? "Settings" : "الإعدادات"}</Text>
    <Text style={[styles.subtitle, dark && styles.darkMuted]}>{english ? "Make Hijri yours" : "خصص تجربة هجري كما تحب"}</Text>

    <Text style={[styles.group, dark && styles.darkMuted]}>{english ? "PREFERENCES" : "التفضيلات"}</Text>
    <View style={[styles.panel, dark && styles.darkPanel]}>
      <Row icon="language" title={english ? "Language" : "اللغة"} subtitle={english ? "English" : "العربية"} right={<Pressable onPress={() => setEnglish(!english)}><Text style={styles.action}>{english ? "العربية" : "EN"}</Text></Pressable>} />
      <Row icon="dark-mode" title={english ? "Dark mode" : "الوضع الداكن"} subtitle={english ? "Comfortable at night" : "مظهر مريح للعين ليلًا"} right={<Switch value={dark} onValueChange={setDark} trackColor={{ false: "#c9d8ce", true: green }} thumbColor="#fff" />} />
      <Row icon="notifications-active" title={english ? "Prayer alerts" : "تنبيهات الصلاة"} subtitle={english ? "Receive an alert at each prayer" : "استقبل تنبيهًا عند كل صلاة"} right={<Switch value={alerts} onValueChange={setAlerts} trackColor={{ false: "#c9d8ce", true: green }} thumbColor="#fff" />} />
      <Row icon="volume-up" title={english ? "Alert sound" : "صوت التنبيه"} subtitle={english ? "Gentle notification sound" : "صوت تنبيه هادئ"} right={<Switch value={sound} onValueChange={setSound} trackColor={{ false: "#c9d8ce", true: green }} thumbColor="#fff" />} />
    </View>

    <Text style={[styles.group, dark && styles.darkMuted]}>{english ? "PRAYER CALCULATION" : "حساب المواقيت"}</Text>
    <View style={[styles.panel, dark && styles.darkPanel]}>
      <Pressable onPress={() => { setShowCities((value) => !value); setShowMethods(false); }} style={styles.selectRow}><View style={styles.rowIcon}><IconSymbol name={"location-on" as any} size={21} color={green} /></View><View style={styles.rowCopy}><Text style={styles.rowTitle}>{english ? "City" : "المدينة"}</Text><Text style={styles.rowSub}>{prayerSettings.city.nameAr}</Text></View><IconSymbol name={showCities ? ("expand-less" as any) : ("expand-more" as any)} size={22} color="#94a79d" /></Pressable>
      {showCities && <View style={styles.optionList}>{CITY_OPTIONS.map((city) => <Pressable key={city.id} onPress={() => { prayerSettings.selectCity(city); setShowCities(false); }} style={[styles.option, prayerSettings.city.id === city.id && styles.selectedOption]}><Text style={[styles.optionTitle, prayerSettings.city.id === city.id && styles.selectedText]}>{english ? city.nameEn : city.nameAr}</Text>{prayerSettings.city.id === city.id && <IconSymbol name={"check" as any} size={19} color={green} />}</Pressable>)}</View>}
      <Pressable onPress={() => { setShowMethods((value) => !value); setShowCities(false); }} style={styles.selectRow}><View style={styles.rowIcon}><IconSymbol name={"schedule" as any} size={21} color={green} /></View><View style={styles.rowCopy}><Text style={styles.rowTitle}>{english ? "Calculation method" : "طريقة الحساب"}</Text><Text style={styles.rowSub}>{english ? selectedMethod.nameEn : selectedMethod.nameAr}</Text></View><IconSymbol name={showMethods ? ("expand-less" as any) : ("expand-more" as any)} size={22} color="#94a79d" /></Pressable>
      {showMethods && <View style={styles.optionList}>{CALCULATION_METHODS.map((method) => <Pressable key={method.id} onPress={() => { prayerSettings.selectMethod(method.id); setShowMethods(false); }} style={[styles.option, prayerSettings.method === method.id && styles.selectedOption]}><View style={styles.methodCopy}><Text style={[styles.optionTitle, prayerSettings.method === method.id && styles.selectedText]}>{english ? method.nameEn : method.nameAr}</Text><Text style={styles.optionSub}>{english ? method.descriptionEn : method.descriptionAr}</Text></View>{prayerSettings.method === method.id && <IconSymbol name={"check" as any} size={19} color={green} />}</Pressable>)}</View>}
      <Text style={styles.savedHint}>{english ? "Changes are saved automatically and update the home screen." : "يتم حفظ التغييرات تلقائيًا وتحديث الصفحة الرئيسية."}</Text>
    </View>

    <View style={styles.brand}><View style={styles.logo}><Text style={styles.logoText}>☾</Text></View><Text style={[styles.brandTitle, dark && styles.darkText]}>Hijri</Text><Text style={[styles.version, dark && styles.darkMuted]}>Version 1.1.0 • صُنع بخشوع</Text></View>
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { paddingTop: 22, paddingBottom: 35 }, title: { color: green, fontSize: 30, fontWeight: "800" }, subtitle: { color: "#83958c", fontSize: 13, marginTop: 5 }, group: { color: "#8ba097", fontSize: 11, fontWeight: "800", letterSpacing: 1, marginTop: 28, marginBottom: 10 }, panel: { backgroundColor: "#fff", borderRadius: 19, paddingHorizontal: 15, borderWidth: 1, borderColor: "#e1ebe4" }, darkPanel: { backgroundColor: "#1c362d", borderColor: "#315446" }, row: { minHeight: 73, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#edf2ee" }, selectRow: { minHeight: 73, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#edf2ee" }, rowIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#e5f0e8", alignItems: "center", justifyContent: "center" }, rowCopy: { flex: 1, marginLeft: 12 }, rowTitle: { color: "#24463b", fontSize: 15, fontWeight: "700" }, rowSub: { color: "#91a098", fontSize: 11, marginTop: 4 }, action: { color: green, fontSize: 13, fontWeight: "800", backgroundColor: "#e6f0e8", paddingHorizontal: 11, paddingVertical: 7, borderRadius: 12 }, optionList: { paddingBottom: 9 }, option: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6, padding: 12, borderRadius: 13, backgroundColor: "#f4f8f4" }, selectedOption: { backgroundColor: "#e4f1e7" }, optionTitle: { color: "#31594b", fontSize: 13, fontWeight: "700" }, selectedText: { color: green }, optionSub: { color: "#8b9d94", fontSize: 10, marginTop: 3 }, methodCopy: { flex: 1 }, savedHint: { color: "#8b9d94", fontSize: 10, lineHeight: 16, marginVertical: 13, textAlign: "center" }, brand: { alignItems: "center", marginTop: 38 }, logo: { width: 48, height: 48, borderRadius: 24, backgroundColor: green, alignItems: "center", justifyContent: "center" }, logoText: { color: "#d9aa55", fontSize: 31 }, brandTitle: { color: green, fontSize: 20, fontWeight: "800", marginTop: 8 }, version: { color: "#9aa9a1", fontSize: 11, marginTop: 4 }, darkText: { color: "#eaf5ed" }, darkMuted: { color: "#a7bcb1" } });
