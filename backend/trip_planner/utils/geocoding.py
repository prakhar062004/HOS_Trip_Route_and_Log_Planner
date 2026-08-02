import requests
import time

def geocode_location(location_name: str) -> tuple[float, float] | None:
  """
  Geocodes a location query (e.g. "Chicago, IL") using the free OpenStreetMap Nominatim API.
  Returns a tuple of (latitude, longitude) or None if not found/error.
  """
  if not location_name:
    return None

  url = "https://nominatim.openstreetmap.org/search"
  headers = {
    # Nominatim requires a descriptive User-Agent
    "User-Agent": "HOSRouteLogPlanner/1.0 (contact: support@hosplanner.local)"
  }
  params = {
    "q": location_name,
    "format": "json",
    "limit": 1
  }

  try:
    # Adding a small delay to respect Nominatim's rate limits
    time.sleep(1.0)
    response = requests.get(url, params=params, headers=headers, timeout=10)
    response.raise_for_status()
    data = response.json()

    if data:
      lat = float(data[0]["lat"])
      lon = float(data[0]["lon"])
      return lat, lon
  except Exception as e:
    print(f"Geocoding error for '{location_name}': {e}")
  
  return None
