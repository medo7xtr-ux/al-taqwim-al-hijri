import AsyncStorage from "@react-native-async-storage/async-storage";

export type Prayer = { key: string; ar: string; en: string; time: string; icon: string };
export type PrayerMethod = "standard" | "ummAlQura" | "mwl" | "egyptian";
const pad = (value: number) => String(value).padStart(2, "0");
const API_BASE = "https://api.aladhan.com/v1/timings";
const CACHE_PREFIX = "hijri-prayer-api-v1:";
const API_METHODS: Record<PrayerMethod, number> = { standard: 3, ummAlQura: 4, mwl: 3, egyptian: 5 };

export function gregorianToHijri(date = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", { day: "numeric", month: "numeric", year: "numeric" }).formatToParts(date);
    const values = Object.fromEntries(parts.filter((part) => part.type === "day" || part.type === "month" || part.type === "year").map((part) => [part.type, Number(part.value)]));
    if (values.day && values.month && values.year) return { day: values.day, month: values.month, year: values.year };
  } catch {
    // Fall through to the arithmetic conversion on runtimes without the Umm al-Qura calendar.
  }
  const jd = Math.floor(date.getTime() / 86400000 + 2440587.5);
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const m = Math.floor((24 * l3) / 709);
  const d = l3 - Math.floor((709 * m) / 24);
  const y = 30 * n + j - 30;
  return { day: d, month: m, year: y };
}

export function hijriLabel(date = new Date(), english = false) {
  const h = gregorianToHijri(date);
  const monthsAr = ["", "المحرّم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوّال", "ذو القعدة", "ذو الحجة"];
  const monthsEn = ["", "Muharram", "Safar", "Rabi al-Awwal", "Rabi al-Thani", "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"];
  return `${h.day} ${english ? monthsEn[h.month] : monthsAr[h.month]} ${h.year}`;
}

const fmt = (hours: number) => {
  const normalized = (hours + 24) % 24;
  const h = Math.floor(normalized);
  const m = Math.round((normalized % 1) * 60) % 60;
  return `${pad(h)}:${pad(m)}`;
};

/** Local fallback used when the network is unavailable. API results are preferred. */
export function calculatePrayers(latitude: number, longitude: number, date = new Date(), method: PrayerMethod = "standard"): Prayer[] {
  const timezoneOffset = -date.getTimezoneOffset() / 60;
  const seasonal = Math.sin((date.getMonth() / 12) * Math.PI * 2) * 0.35;
  const longitudeAdjust = (longitude / 15 - timezoneOffset) * 4;
  const latitudeAdjust = Math.max(-0.4, Math.min(0.4, Math.abs(latitude) / 180));
  const sunrise = 6.15 - seasonal + longitudeAdjust / 60 + latitudeAdjust;
  const sunset = 18.05 + seasonal + longitudeAdjust / 60 - latitudeAdjust;
  const methodShift = { standard: { fajr: 0, isha: 0 }, ummAlQura: { fajr: 0.05, isha: -0.1 }, mwl: { fajr: -0.08, isha: 0.08 }, egyptian: { fajr: -0.04, isha: 0.04 } }[method];
  return [
    { key: "fajr", ar: "الفجر", en: "Fajr", time: fmt(sunrise - 1.45 + methodShift.fajr), icon: "wb-twilight" },
    { key: "sunrise", ar: "الشروق", en: "Sunrise", time: fmt(sunrise), icon: "wb-sunny" },
    { key: "dhuhr", ar: "الظهر", en: "Dhuhr", time: fmt(12.2 + longitudeAdjust / 60), icon: "light-mode" },
    { key: "asr", ar: "العصر", en: "Asr", time: fmt(15.45 + longitudeAdjust / 60), icon: "wb-cloudy" },
    { key: "maghrib", ar: "المغرب", en: "Maghrib", time: fmt(sunset), icon: "brightness-3" },
    { key: "isha", ar: "العشاء", en: "Isha", time: fmt(sunset + 1.35 + methodShift.isha), icon: "nights-stay" },
  ];
}

function apiDate(date: Date) {
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
}

function mapApiTimings(timings: Record<string, string>): Prayer[] {
  const clean = (value: string) => value.split(" ")[0];
  return [
    { key: "fajr", ar: "الفجر", en: "Fajr", time: clean(timings.Fajr), icon: "wb-twilight" },
    { key: "sunrise", ar: "الشروق", en: "Sunrise", time: clean(timings.Sunrise), icon: "wb-sunny" },
    { key: "dhuhr", ar: "الظهر", en: "Dhuhr", time: clean(timings.Dhuhr), icon: "light-mode" },
    { key: "asr", ar: "العصر", en: "Asr", time: clean(timings.Asr), icon: "wb-cloudy" },
    { key: "maghrib", ar: "المغرب", en: "Maghrib", time: clean(timings.Maghrib), icon: "brightness-3" },
    { key: "isha", ar: "العشاء", en: "Isha", time: clean(timings.Isha), icon: "nights-stay" },
  ];
}

export async function fetchPrayerTimes(latitude: number, longitude: number, date = new Date(), method: PrayerMethod = "standard"): Promise<{ prayers: Prayer[]; source: "api" | "cache" | "local" }> {
  const key = `${CACHE_PREFIX}${apiDate(date)}:${latitude.toFixed(4)}:${longitude.toFixed(4)}:${method}`;
  const fallback = calculatePrayers(latitude, longitude, date, method);
  try {
    const response = await Promise.race([
      fetch(`${API_BASE}/${apiDate(date)}?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&method=${API_METHODS[method]}`),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 8000)),
    ]);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const prayers = mapApiTimings(payload?.data?.timings ?? {});
    if (prayers.every((item) => /^\d{2}:\d{2}$/.test(item.time))) {
      await AsyncStorage.setItem(key, JSON.stringify(prayers));
      return { prayers, source: "api" };
    }
  } catch {
    // Continue with the most recent cached schedule or the deterministic local fallback.
  }
  try {
    const cached = await AsyncStorage.getItem(key);
    if (cached) return { prayers: JSON.parse(cached) as Prayer[], source: "cache" };
  } catch {
    // Ignore storage failures.
  }
  return { prayers: fallback, source: "local" };
}

export function todayGregorianLabel(english = false) {
  return new Intl.DateTimeFormat(english ? "en-US" : "ar-SA", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
}

export const defaultPrayers = calculatePrayers(15.3694, 44.1910);
