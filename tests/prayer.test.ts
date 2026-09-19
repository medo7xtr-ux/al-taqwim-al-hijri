import { describe, expect, it } from "vitest";
import { calculatePrayers, gregorianToHijri, hijriLabel } from "../lib/prayer";

describe("prayer calculations", () => {
  it("converts a known Gregorian date to a stable Hijri date", () => {
    const value = gregorianToHijri(new Date("2026-09-19T12:00:00Z"));
    expect(value.year).toBeGreaterThan(1400);
    expect(value.month).toBeGreaterThanOrEqual(1);
    expect(value.month).toBeLessThanOrEqual(12);
    expect(value.day).toBeGreaterThanOrEqual(1);
    expect(value.day).toBeLessThanOrEqual(30);
    expect(hijriLabel(new Date("2026-09-19T12:00:00Z"))).toContain("1448");
  });

  it("returns the six daily prayer entries in chronological order", () => {
    const prayers = calculatePrayers(24.7136, 46.6753, new Date("2026-09-19T12:00:00"));
    expect(prayers).toHaveLength(6);
    expect(prayers.map((item) => item.key)).toEqual(["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"]);
    expect(prayers.every((item) => /^\d{2}:\d{2}$/.test(item.time))).toBe(true);
    expect(prayers.every((item) => item.ar.length > 0 && item.en.length > 0)).toBe(true);
  });
});
