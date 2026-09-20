import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CalculationMethod = "standard" | "ummAlQura" | "mwl" | "egyptian";
export type LocationMode = "manual" | "current";

export type CityOption = {
  id: string;
  nameAr: string;
  nameEn: string;
  latitude: number;
  longitude: number;
};

export const CITY_OPTIONS: CityOption[] = [
  { id: "sanaa", nameAr: "صنعاء، اليمن", nameEn: "Sana'a, Yemen", latitude: 15.3694, longitude: 44.191 },
  { id: "makkah", nameAr: "مكة، السعودية", nameEn: "Makkah, Saudi Arabia", latitude: 21.4225, longitude: 39.8262 },
  { id: "riyadh", nameAr: "الرياض، السعودية", nameEn: "Riyadh, Saudi Arabia", latitude: 24.7136, longitude: 46.6753 },
  { id: "cairo", nameAr: "القاهرة، مصر", nameEn: "Cairo, Egypt", latitude: 30.0444, longitude: 31.2357 },
  { id: "dubai", nameAr: "دبي، الإمارات", nameEn: "Dubai, UAE", latitude: 25.2048, longitude: 55.2708 },
];

export const CALCULATION_METHODS: { id: CalculationMethod; nameAr: string; nameEn: string; descriptionAr: string; descriptionEn: string }[] = [
  { id: "standard", nameAr: "الطريقة القياسية", nameEn: "Standard", descriptionAr: "إعداد متوازن لمعظم المواقع", descriptionEn: "Balanced settings for most locations" },
  { id: "ummAlQura", nameAr: "أم القرى", nameEn: "Umm al-Qura", descriptionAr: "مناسبة للمملكة العربية السعودية", descriptionEn: "Recommended for Saudi Arabia" },
  { id: "mwl", nameAr: "رابطة العالم الإسلامي", nameEn: "Muslim World League", descriptionAr: "إعداد شائع للمواقع العالمية", descriptionEn: "Common international setting" },
  { id: "egyptian", nameAr: "الهيئة المصرية", nameEn: "Egyptian General Authority", descriptionAr: "مناسبة لمصر وشمال أفريقيا", descriptionEn: "Suitable for Egypt and North Africa" },
];

type PrayerSettings = { locationMode: LocationMode; city: CityOption; method: CalculationMethod };
type SettingsContextValue = PrayerSettings & { hydrated: boolean; selectCity: (city: CityOption) => void; selectMethod: (method: CalculationMethod) => void; useCurrentLocation: (city: CityOption) => void };

const STORAGE_KEY = "hijri-prayer-settings-v1";
const defaultSettings: PrayerSettings = { locationMode: "manual", city: CITY_OPTIONS[0], method: "standard" };
const SettingsContext = createContext<SettingsContextValue | null>(null);

export function PrayerSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PrayerSettings>(defaultSettings);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value) {
        try { setSettings({ ...defaultSettings, ...JSON.parse(value) }); } catch { /* use defaults */ }
      }
    }).finally(() => setHydrated(true));
  }, []);

  const persist = (next: PrayerSettings) => {
    setSettings(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
  };

  const value = useMemo<SettingsContextValue>(() => ({
    ...settings,
    hydrated,
    selectCity: (city) => persist({ ...settings, city, locationMode: "manual" }),
    selectMethod: (method) => persist({ ...settings, method }),
    useCurrentLocation: (city) => persist({ ...settings, city, locationMode: "current" }),
  }), [settings, hydrated]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function usePrayerSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("usePrayerSettings must be used inside PrayerSettingsProvider");
  return context;
}
