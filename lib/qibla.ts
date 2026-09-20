const KAABA_LATITUDE = 21.4225;
const KAABA_LONGITUDE = 39.8262;
const EARTH_RADIUS_KM = 6371;

const toRadians = (value: number) => (value * Math.PI) / 180;
const toDegrees = (value: number) => (value * 180) / Math.PI;

export function normalizeDegrees(value: number) {
  return (value + 360) % 360;
}

export function calculateQiblaBearing(latitude: number, longitude: number) {
  const userLatitude = toRadians(latitude);
  const kaabaLatitude = toRadians(KAABA_LATITUDE);
  const deltaLongitude = toRadians(KAABA_LONGITUDE - longitude);
  const y = Math.sin(deltaLongitude);
  const x =
    Math.cos(userLatitude) * Math.tan(kaabaLatitude) -
    Math.sin(userLatitude) * Math.cos(deltaLongitude);

  return normalizeDegrees(toDegrees(Math.atan2(y, x)));
}

export function getQiblaRotation(qiblaBearing: number, deviceHeading: number) {
  return normalizeDegrees(qiblaBearing - deviceHeading);
}

export function calculateDistanceToKaaba(latitude: number, longitude: number) {
  const latitudeOne = toRadians(latitude);
  const latitudeTwo = toRadians(KAABA_LATITUDE);
  const deltaLatitude = toRadians(KAABA_LATITUDE - latitude);
  const deltaLongitude = toRadians(KAABA_LONGITUDE - longitude);
  const a =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(latitudeOne) *
      Math.cos(latitudeTwo) *
      Math.sin(deltaLongitude / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function bearingLabel(bearing: number, english = false) {
  const directions = english
    ? ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    : ["شمال", "شمال شرقي", "شرق", "جنوب شرقي", "جنوب", "جنوب غربي", "غرب", "شمال غربي"];
  return directions[Math.round(normalizeDegrees(bearing) / 45) % 8];
}

export const kaabaCoordinates = { latitude: KAABA_LATITUDE, longitude: KAABA_LONGITUDE };
