// Enkel wrapper för Open-Meteo (ingen API-nyckel behövs)
export async function fetchCurrentWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: "temperature_2m,weather_code,wind_speed_10m",
    timezone: "auto",
  });
  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather API error");
  const data = await res.json();

  const c = data?.current;
  if (!c) throw new Error("No current weather");

  return {
    tempC: c.temperature_2m ?? null,
    windMps: c.wind_speed_10m ?? null,
    code: c.weather_code ?? null,
    time: c.time ?? null,
    // Minimal text – kan mappas snyggare vid behov
    desc: weatherCodeToText(c.weather_code),
  };
}

function weatherCodeToText(code) {
  // Lite förenklad mappning (Open-Meteo weather codes)
  if (code == null) return null;
  if ([0].includes(code)) return "Clear";
  if ([1, 2, 3].includes(code)) return "Partly cloudy";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 61, 63, 65].includes(code)) return "Rain";
  if ([71, 73, 75].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "—";
}
