import { describe, expect, it } from "vitest";
import { calculatePrayers, gregorianToHijri, hijriLabel } from "../lib/prayer";
import { bearingLabel, calculateDistanceToKaaba, calculateQiblaBearing, getQiblaRotation } from "../lib/qibla";

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

  it("calculates a stable Qibla bearing for Sana'a", () => {
    const bearing = calculateQiblaBearing(15.3694, 44.191);
    expect(bearing).toBeGreaterThan(300);
    expect(bearing).toBeLessThan(330);
    expect(bearingLabel(bearing)).toContain("شمال");
  });

  it("normalizes the device-relative Qibla rotation and calculates distance", () => {
    expect(getQiblaRotation(10, 350)).toBe(20);
    expect(calculateDistanceToKaaba(21.4225, 39.8262)).toBeLessThan(0.01);
  });
});
