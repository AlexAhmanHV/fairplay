export function formatWeatherLine(weather) {
  const parts = [];
  if (typeof weather?.tempC === "number") parts.push(`${Math.round(weather.tempC)}°C`);
  if (weather?.desc) parts.push(weather.desc);
  if (typeof weather?.windMps === "number") parts.push(`${Math.round(weather.windMps)} m/s`);
  if (weather?.time) {
    try {
      const d = new Date(weather.time);
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      parts.push(`${hh}:${mm}`);
    } catch {}
  }
  return parts.join(" • ");
}
