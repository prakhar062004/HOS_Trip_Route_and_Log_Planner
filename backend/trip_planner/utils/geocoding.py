import requests
import time

def geocode_location(location_name: str) -> tuple[float, float] | None:
  """
  Geocodes a location query (e.g. "Chicago, IL") using OpenStreetMap Nominatim.
  If Nominatim fails (due to cloud blocks or rate limits), seamlessly falls back to Photon API.
  Returns a tuple of (latitude, longitude) or None if not found/error.
  """
  if not location_name:
    return None

  # 1. Primary Attempt: Nominatim API
  url = "https://nominatim.openstreetmap.org/search"
  headers = {
    "User-Agent": "HOS_Trip_Route_and_Log_Planner/1.0 (prakhargupta062004@gmail.com)"
  }
  params = {
    "q": location_name,
    "format": "json",
    "limit": 1
  }

  try:
    time.sleep(1.0) # Respect rate limits
    response = requests.get(url, params=params, headers=headers, timeout=10)
    response.raise_for_status()
    data = response.json()

    if data:
      lat = float(data[0]["lat"])
      lon = float(data[0]["lon"])
      return lat, lon
  except Exception as e:
    print(f"Nominatim geocoding failed for '{location_name}', attempting Photon fallback: {e}")

  # 2. Fallback Attempt: Photon API (by Komoot)
  try:
    photon_url = "https://photon.komoot.io/api/"
    photon_params = {
      "q": location_name,
      "limit": 1
    }
    photon_headers = {
      "User-Agent": "HOS_Trip_Route_and_Log_Planner/1.0 (prakhargupta062004@gmail.com)"
    }
    response = requests.get(photon_url, params=photon_params, headers=photon_headers, timeout=10)
    response.raise_for_status()
    data = response.json()

    features = data.get("features", [])
    if features:
      coords = features[0].get("geometry", {}).get("coordinates", [])
      if len(coords) == 2:
        # Photon coordinates are [longitude, latitude]
        return float(coords[1]), float(coords[0])
  except Exception as photon_e:
    print(f"Photon fallback geocoding also failed for '{location_name}': {photon_e}")

  return None
