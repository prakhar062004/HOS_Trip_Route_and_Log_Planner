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
        leg1_dist_km = route1["distance_meters"] / 1000.0
        
        # Assume an average driving speed of 50 km/h in India
        scheduler.plan_activity("DRIVING", leg1_duration_hrs, current_loc_name, "Driving to Pickup", speed_kmh=50.0)

        # Pickup loading (1 hour On Duty)
        scheduler.plan_activity("ON_DUTY", 1.0, pickup_loc_name, "Loading Cargo (Pickup)")

        # Leg 2: Pickup to Dropoff
        leg2_duration_hrs = route2["duration_seconds"] / 3600.0
        leg2_dist_km = route2["distance_meters"] / 1000.0
        
        scheduler.plan_activity("DRIVING", leg2_duration_hrs, pickup_loc_name, "Driving to Dropoff", speed_kmh=50.0)

        # Dropoff unloading (1 hour On Duty)
        scheduler.plan_activity("ON_DUTY", 1.0, dropoff_loc_name, "Unloading Cargo (Dropoff)")

        # 4. Generate Daily Log Sheets
        carrier_info = {
            "fromCity": current_loc_name,
            "toCity": dropoff_loc_name,
            "carrierName": data.get("carrierName", "Interstate Freight Logistics"),
            "mainOfficeAddress": data.get("mainOfficeAddress", "500 Logistics Parkway, Chicago, IL 60611"),
            "homeTerminalAddress": data.get("homeTerminalAddress", "Chicago Terminal #12, Chicago, IL"),
            "truckTractorNumber": data.get("truckTractorNumber", "TRK-905"),
            "trailerNumber": data.get("trailerNumber", "TRL-402"),
            "licensePlate": data.get("licensePlate", "IL 948-2831"),
            "odometerStart": int(data.get("odometerStart", 124500)),
            "shipper": data.get("shipper", "Midwest Distribution Co."),
            "commodity": data.get("commodity", "Industrial Cargo"),
            "driverName": data.get("driverName", "Alexander J. Mercer")
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
        total_dist_km = leg1_dist_km + leg2_dist_km
        total_driving_hours = leg1_duration_hrs + leg2_duration_hrs

        # Return full payload
        return Response({
            "start_coords": current_coords,
            "pickup_coords": pickup_coords,
            "dropoff_coords": dropoff_coords,
            "route_geometry_1": route1["geometry"],
            "route_geometry_2": route2["geometry"],
            "total_distance_miles": round(total_dist_km, 1), # Kept key name for frontend compatibility
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
        headers = {
            "User-Agent": "HOSRouteLogPlanner/1.0 (contact: support@hosplanner.local)"
        }
        params = {
            "q": query,
            "format": "json",
            "countrycodes": "in", # Restrict results to India
            "limit": 5
        }
        
        try:
            response = requests.get(url, params=params, headers=headers, timeout=6)
            response.raise_for_status()
            data = response.json()
            
            suggestions = []
            for item in data:
                suggestions.append({
                    "display_name": item.get("display_name"),
                    "lat": float(item.get("lat")),
                    "lon": float(item.get("lon"))
                })
            return Response(suggestions)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

