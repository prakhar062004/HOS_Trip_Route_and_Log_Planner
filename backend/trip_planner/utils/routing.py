import requests

def get_osrm_route(start_coords: tuple[float, float], end_coords: tuple[float, float]) -> dict | None:
  """
  Queries the open-source OSRM routing API to find the driving distance, duration,
  and full GeoJSON coordinate path geometry between two points.
  """
  start_lat, start_lon = start_coords
  end_lat, end_lon = end_coords

  # OSRM format: lon,lat;lon,lat
  coords_str = f"{start_lon},{start_lat};{end_lon},{end_lat}"
  url = f"http://router.project-osrm.org/route/v1/driving/{coords_str}"
  
  params = {
    "overview": "full",
    "geometries": "geojson",
    "steps": "false"
  }

  try:
    response = requests.get(url, params=params, timeout=15)
    response.raise_for_status()
    data = response.json()

    if data.get("code") == "Ok" and data.get("routes"):
      route = data["routes"][0]
      return {
        "distance_meters": route["distance"],
        "duration_seconds": route["duration"],
        "geometry": route["geometry"] # Contains {"type": "LineString", "coordinates": [[lon, lat], ...]}
      }
  except Exception as e:
    print(f"OSRM routing error: {e}")
  
  return None
