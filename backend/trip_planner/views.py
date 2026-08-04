import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime


from .utils.geocoding import geocode_location
from .utils.routing import get_osrm_route
from .utils.hos_scheduler import HOSScheduler, generate_daily_logs

class PlanTripView(APIView):
    def post(self, request):
        data = request.data
        
        current_loc_name = data.get("current_location", "").strip()
        pickup_loc_name = data.get("pickup_location", "").strip()
        dropoff_loc_name = data.get("dropoff_location", "").strip()
        
        try:
            cycle_hours = float(data.get("cycle_hours", 0.0))
        except ValueError:
            cycle_hours = 0.0

        start_date_str = data.get("start_date", "").strip()
        if not start_date_str:
            start_date_str = datetime.today().strftime("%Y-%m-%d")

        # Validation
        if not current_loc_name or not pickup_loc_name or not dropoff_loc_name:
            return Response(
                {"error": "All locations (current, pickup, dropoff) are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1. Geocoding
        current_coords = geocode_location(current_loc_name)
        if not current_coords:
            return Response(
                {"error": f"Could not geocode current location: '{current_loc_name}'"},
                status=status.HTTP_400_BAD_REQUEST
            )

        pickup_coords = geocode_location(pickup_loc_name)
        if not pickup_coords:
            return Response(
                {"error": f"Could not geocode pickup location: '{pickup_loc_name}'"},
                status=status.HTTP_400_BAD_REQUEST
            )

        dropoff_coords = geocode_location(dropoff_loc_name)
        if not dropoff_coords:
            return Response(
                {"error": f"Could not geocode dropoff location: '{dropoff_loc_name}'"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. OSRM Routing
        # Route Leg 1: Current -> Pickup
        route1 = get_osrm_route(current_coords, pickup_coords)
        if not route1:
            return Response(
                {"error": "Failed to calculate route from current location to pickup point."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Route Leg 2: Pickup -> Dropoff
        route2 = get_osrm_route(pickup_coords, dropoff_coords)
        if not route2:
            return Response(
                {"error": "Failed to calculate route from pickup point to dropoff destination."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3. Schedule the HOS Log Activities
        scheduler = HOSScheduler(start_date_str, cycle_hours)

        # Leg 1: Current to Pickup
        leg1_duration_hrs = route1["duration_seconds"] / 3600.0
        leg1_dist_miles = route1["distance_meters"] * 0.000621371
        
        # Assume an average driving speed of 55 mph
        scheduler.plan_activity("DRIVING", leg1_duration_hrs, current_loc_name, "Driving to Pickup", speed_mph=55.0)

        # Pickup loading (1 hour On Duty)
        scheduler.plan_activity("ON_DUTY", 1.0, pickup_loc_name, "Loading Cargo (Pickup)")

        # Leg 2: Pickup to Dropoff
        leg2_duration_hrs = route2["duration_seconds"] / 3600.0
        leg2_dist_miles = route2["distance_meters"] * 0.000621371
        
        scheduler.plan_activity("DRIVING", leg2_duration_hrs, pickup_loc_name, "Driving to Dropoff", speed_mph=55.0)

        # Dropoff unloading (1 hour On Duty)
        scheduler.plan_activity("ON_DUTY", 1.0, dropoff_loc_name, "Unloading Cargo (Dropoff)")

        # 4. Generate Daily Log Sheets
        odo_start_raw = data.get("odometerStart")
        try:
            odo_start = int(odo_start_raw) if odo_start_raw else 124500
        except ValueError:
            odo_start = 124500

        carrier_info = {
            "fromCity": current_loc_name,
            "toCity": dropoff_loc_name,
            "carrierName": data.get("carrierName") or "Interstate Freight Logistics",
            "mainOfficeAddress": data.get("mainOfficeAddress") or "500 Logistics Parkway, Chicago, IL 60611",
            "homeTerminalAddress": data.get("homeTerminalAddress") or "Chicago Terminal #12, Chicago, IL",
            "truckTractorNumber": data.get("truckTractorNumber") or "TRK-905",
            "trailerNumber": data.get("trailerNumber") or "TRL-402",
            "licensePlate": data.get("licensePlate") or "IL 948-2831",
            "odometerStart": odo_start,
            "shipper": data.get("shipper") or "Midwest Distribution Co.",
            "commodity": data.get("commodity") or "Industrial Cargo",
            "driverName": data.get("driverName") or "Alexander J. Mercer"
        }
        
        daily_logs = generate_daily_logs(
            scheduler.events, 
            start_date_str, 
            cycle_hours, 
            carrier_info
        )

        # 5. Extract intermediate stops (e.g. resting, fueling) for map markers
        stops = []
        for idx, event in enumerate(scheduler.events):
            # Only include non-driving stops (rests, fuels, loading)
            if event["status"] in ["OFF_DUTY", "SLEEPER", "ON_DUTY"]:
                # Convert datetime to string for response JSON serialization
                stops.append({
                    "id": f"stop-{idx}",
                    "status": event["status"],
                    "location": event["location"],
                    "description": event["description"],
                    "startTime": event["start"].strftime("%Y-%m-%d %H:%M"),
                    "endTime": event["end"].strftime("%Y-%m-%d %H:%M"),
                    "durationHours": round((event["end"] - event["start"]).total_seconds() / 3600.0, 2)
                })

        # Calculate cumulative distances/times
        total_dist_miles = leg1_dist_miles + leg2_dist_miles
        total_driving_hours = leg1_duration_hrs + leg2_duration_hrs

        # Return full payload
        return Response({
            "start_coords": current_coords,
            "pickup_coords": pickup_coords,
            "dropoff_coords": dropoff_coords,
            "route_geometry_1": route1["geometry"],
            "route_geometry_2": route2["geometry"],
            "total_distance_miles": round(total_dist_miles, 1),
            "total_driving_hours": round(total_driving_hours, 1),
            "stops": stops,
            "daily_logs": daily_logs
        }, status=status.HTTP_200_OK)

class SuggestLocationsView(APIView):
    def get(self, request):
        query = request.query_params.get("q", "").strip()
        if not query:
            return Response([])
        
        url = "https://nominatim.openstreetmap.org/search"
        # Get Accept-Language from client headers to support multi-language auto-suggestions
        accept_lang = request.headers.get("Accept-Language", "en")
        headers = {
            "User-Agent": "HOS_Trip_Route_and_Log_Planner/1.0 (prakhargupta062004@gmail.com)"
        }
        params = {
            "q": query,
            "format": "json",
            "limit": 5,
            "accept-language": accept_lang,
            "addressdetails": 1,  # Request detailed address breakdown
            "viewbox": "68.1,35.5,97.4,6.7", # Bounding box for India to bias results
            "bounded": 0  # Bias suggestions, don't restrict strictly
        }
        
        try:
            response = requests.get(url, params=params, headers=headers, timeout=6)
            response.raise_for_status()
            data = response.json()
            
            suggestions = []
            for item in data:
                try:
                    display_name = item.get("display_name")
                    if not display_name:
                        continue
                        
                    addr = item.get("address", {})
                    
                    # Extract primary place name
                    place_name = (
                        addr.get("city") or 
                        addr.get("town") or 
                        addr.get("village") or 
                        addr.get("municipality") or 
                        addr.get("suburb") or 
                        addr.get("neighbourhood") or
                        addr.get("building") or
                        addr.get("amenity") or
                        addr.get("state") or  # fallback to state for state searches
                        display_name.split(",")[0]
                    )
                    
                    state = addr.get("state")
                    country = addr.get("country")
                    
                    # Build concise display name containing state and country
                    parts = []
                    if place_name:
                        parts.append(place_name)
                    if state and state != place_name:
                        parts.append(state)
                    if country and country != place_name:
                        parts.append(country)
                    
                    formatted_name = ", ".join(parts)
                    if not formatted_name:
                        formatted_name = display_name
                    
                    lat_val = item.get("lat")
                    lon_val = item.get("lon")
                    if lat_val is not None and lon_val is not None:
                        suggestions.append({
                            "display_name": formatted_name,
                            "lat": float(lat_val),
                            "lon": float(lon_val)
                        })
                except Exception as inner_e:
                    # Graceful fallback: use raw item details if parsing failed
                    try:
                        suggestions.append({
                            "display_name": item.get("display_name", "Unknown Location"),
                            "lat": float(item.get("lat", 0)),
                            "lon": float(item.get("lon", 0))
                        })
                    except:
                        pass
            return Response(suggestions)
        except Exception as e:
            # Always return a 200 response containing empty suggestions list if API is down, preserving frontend stability
            print(f"Suggestions fetching failed: {e}")
            return Response([])


