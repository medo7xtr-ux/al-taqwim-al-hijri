import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import * as Location from "expo-location";

type HeadingSubscription = { remove: () => void };

export function useDeviceHeading() {
  const [heading, setHeading] = useState(0);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [available, setAvailable] = useState(false);
  const previousHeading = useRef(0);

  useEffect(() => {
    let subscription: HeadingSubscription | undefined;
    let active = true;

    const startCompass = async () => {
      if (Platform.OS === "web") return;
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== "granted" || !active) return;
        subscription = await Location.watchHeadingAsync((data) => {
          const nextHeading = data.trueHeading >= 0 ? data.trueHeading : data.magHeading;
          const delta = ((nextHeading - previousHeading.current + 540) % 360) - 180;
          const smoothed = (previousHeading.current + delta * 0.2 + 360) % 360;
          previousHeading.current = smoothed;
          setHeading(smoothed);
          setAccuracy(data.accuracy);
          setAvailable(true);
        });
      } catch {
        setAvailable(false);
      }
    };

    startCompass();
    return () => {
      active = false;
      subscription?.remove();
    };
  }, []);

  return { heading, accuracy, available };
}
