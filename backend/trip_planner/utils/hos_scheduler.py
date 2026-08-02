from datetime import datetime, timedelta
import math

class HOSScheduler:
    def __init__(self, start_date_str: str, current_cycle_used: float):
        # Initialize trip start at 08:00 AM on the given start date
        self.start_time = datetime.strptime(start_date_str + "T08:00:00", "%Y-%m-%dT%H:%M:%S")
        self.current_time = self.start_time
        
        # HOS tracking clocks (in hours)
        self.driving_since_last_rest = 0.0
        self.duty_since_last_rest = 0.0
        self.driving_since_last_break = 0.0
        self.rolling_70_hour_clock = current_cycle_used
        self.miles_since_fueling = 0.0
        
        # Raw event log of the entire trip
        self.events = []

    def get_time_string(self, dt: datetime) -> str:
        return dt.strftime("%H:%M")

    def get_date_string(self, dt: datetime) -> str:
        return dt.strftime("%Y-%m-%d")

    def add_event(self, status: str, duration_hours: float, location: str, description: str):
        end_time = self.current_time + timedelta(hours=duration_hours)
        self.events.append({
            "start": self.current_time,
            "end": end_time,
            "status": status,
            "location": location,
            "description": description
        })
        self.current_time = end_time

    def schedule_rest(self, rest_type: str, duration_hours: float, location: str):
        """Schedules rest break and resets corresponding clocks."""
        self.add_event(rest_type, duration_hours, location, f"{duration_hours}-hour Rest Period ({rest_type.lower().replace('_', ' ')})")
        
        # Reset clocks
        if duration_hours >= 34.0:
            self.driving_since_last_rest = 0.0
            self.duty_since_last_rest = 0.0
            self.driving_since_last_break = 0.0
            self.rolling_70_hour_clock = 0.0
        elif duration_hours >= 10.0:
            self.driving_since_last_rest = 0.0
            self.duty_since_last_rest = 0.0
            self.driving_since_last_break = 0.0
        elif duration_hours >= 0.5:
            # 30-minute break
            self.driving_since_last_break = 0.0

    def plan_activity(self, activity_type: str, total_hours: float, location: str, description: str, speed_mph: float = 55.0):
        """
        Schedules a driving or on-duty activity. Breaks it down and automatically inserts HOS rests.
        """
        hours_remaining = total_hours
        
        while hours_remaining > 0.001:
            # Check HOS limits
            max_driving_left_today = 11.0 - self.driving_since_last_rest
            max_duty_left_today = 14.0 - self.duty_since_last_rest
            max_driving_until_break = 8.0 - self.driving_since_last_break
            max_cycle_left = 70.0 - self.rolling_70_hour_clock

            # If cycle is fully used, must take a 34-hour restart
            if max_cycle_left <= 0:
                self.schedule_rest("OFF_DUTY", 34.0, location)
                continue

            # If daily driving or duty limits are reached, must take a 10-hour rest
            if (activity_type == "DRIVING" and max_driving_left_today <= 0) or max_duty_left_today <= 0:
                # Standard practice: sleep in sleeper berth
                self.schedule_rest("SLEEPER", 10.0, location)
                continue

            # If 8-hour driving limit is reached, must take a 30-minute break
            if activity_type == "DRIVING" and max_driving_until_break <= 0:
                self.schedule_rest("OFF_DUTY", 0.5, location)
                continue

            # Determine the maximum amount we can perform this activity in this block
            if activity_type == "DRIVING":
                allowed = min(hours_remaining, max_driving_left_today, max_duty_left_today, max_driving_until_break, max_cycle_left)
            else: # ON_DUTY
                allowed = min(hours_remaining, max_duty_left_today, max_cycle_left)

            # Check if we need a fueling stop during this driving block
            if activity_type == "DRIVING":
                miles_to_fuel = 1000.0 - self.miles_since_fueling
                hours_to_fuel = miles_to_fuel / speed_mph
                if hours_to_fuel < allowed:
                    # Drive up to the fueling point
                    allowed = hours_to_fuel
                    # We will perform fueling after this chunk
                    fuel_next = True
                else:
                    fuel_next = False
            else:
                fuel_next = False

            # Add the activity chunk
            self.add_event(activity_type, allowed, location, description)
            
            # Update metrics
            if activity_type == "DRIVING":
                self.driving_since_last_rest += allowed
                self.driving_since_last_break += allowed
                self.miles_since_fueling += allowed * speed_mph
            
            self.duty_since_last_rest += allowed
            self.rolling_70_hour_clock += allowed
            hours_remaining -= allowed

            # If fueling was triggered, schedule a 0.5 hour fueling stop (ON_DUTY)
            if fuel_next:
                self.add_event("ON_DUTY", 0.5, location, "Fueling Vehicle")
                self.duty_since_last_rest += 0.5
                self.rolling_70_hour_clock += 0.5
                self.miles_since_fueling = 0.0



def generate_daily_logs(events, start_date_str: str, current_cycle_used: float, carrier_info: dict) -> list:
    """
    Slices a continuous timeline of events into 24-hour log sheets (00:00 to 24:00).
    """
    if not events:
        return []

    first_event_start = events[0]["start"]
    last_event_end = events[-1]["end"]
    
    trip_start_day = datetime.strptime(start_date_str, "%Y-%m-%d")
    total_days = (last_event_end.date() - trip_start_day.date()).days + 1
    
    daily_logs = []
    
    # Initialize rolling history of hours worked for the bottom recap table
    # We populate the preceding 7 days using sample compliant data
    historical_hours = [6.5, 8.0, 7.5, 0.0, 9.0, 10.0, 8.0]
    
    for day_idx in range(total_days):
        current_day_start = trip_start_day + timedelta(days=day_idx)
        current_day_end = current_day_start + timedelta(days=1)
        
        day_date_str = current_day_start.strftime("%Y-%m-%d")
        
        # Standard daily intervals (00:00 - 24:00)
        day_intervals = []
        day_remarks = []
        
        # Split events falling into this specific calendar day
        # If no events exist yet for a time window (e.g. before 08:00 AM on Day 1),
        # fill it with OFF_DUTY.
        cursor = current_day_start
        
        # Filter events that overlap with current_day
        overlapping_events = []
        for event in events:
            if event["start"] < current_day_end and event["end"] > current_day_start:
                overlapping_events.append(event)
                
        for event in overlapping_events:
            event_start = max(cursor, event["start"])
            event_end = min(current_day_end, event["end"])
            
            # If there's a gap between the cursor and the event, fill with OFF_DUTY
            if event_start > cursor:
                gap_start_str = cursor.strftime("%H:%M")
                gap_end_str = event_start.strftime("%H:%M")
                day_intervals.append({
                    "start": gap_start_str,
                    "end": gap_end_str,
                    "status": "OFF_DUTY"
                })
                cursor = event_start
            
            if event_end > cursor:
                start_str = cursor.strftime("%H:%M")
                # Handle end of day representing as "24:00"
                end_str = "24:00" if event_end == current_day_end else event_end.strftime("%H:%M")
                
                day_intervals.append({
                    "start": start_str,
                    "end": end_str,
                    "status": event["status"]
                })
                
                # Add status change remarks if it's a transition and has a description
                # (usually at the start of the event, inside this day)
                if event["start"] >= current_day_start and event["start"] < current_day_end:
                    # Don't add duplicate time remarks
                    if not any(r["time"] == start_str for r in day_remarks):
                        day_remarks.append({
                            "id": f"rem-{day_idx}-{len(day_remarks)}",
                            "time": start_str,
                            "status": event["status"],
                            "location": event["location"],
                            "text": event["description"]
                        })
                
                cursor = event_end
                
        # Fill remaining gap at the end of the day
        if cursor < current_day_end:
            start_str = cursor.strftime("%H:%M")
            day_intervals.append({
                "start": start_str,
                "end": "24:00",
                "status": "OFF_DUTY"
            })
            
        # Compile previous 7 days of hours for this day's bottom recap calculations
        # As day_idx increases, the window shifts.
        recap_days = []
        for i in range(7, 0, -1):
            target_date = current_day_start - timedelta(days=i)
            # Find if this date was an active day in the trip, or fallback to historical
            active_day_idx = (target_date.date() - trip_start_day.date()).days
            if active_day_idx >= 0:
                # Sum the actual duty hours of that day
                prev_log = daily_logs[active_day_idx]
                duty_hours = 0.0
                for interval in prev_log["intervals"]:
                    if interval["status"] in ["DRIVING", "ON_DUTY"]:
                        s = int(interval["start"].split(":")[0]) * 60 + int(interval["start"].split(":")[1])
                        e_str = "24:00" if interval["end"] == "24:00" else interval["end"]
                        e = 1440 if e_str == "24:00" else int(e_str.split(":")[0]) * 60 + int(e_str.split(":")[1])
                        duty_hours += (e - s) / 60
            else:
                # Fallback to predefined historical cycle values
                history_idx = 7 + active_day_idx
                duty_hours = historical_hours[history_idx] if 0 <= history_idx < 7 else 8.0
                
            recap_days.append({
                "date": target_date.strftime("%Y-%m-%d"),
                "hoursWorked": duty_hours
            })
            
        # Add today (Day 8) to recap
        recap_days.append({
            "date": day_date_str,
            "hoursWorked": 0.0, # Will be computed live on frontend
            "isToday": True
        })

        daily_logs.append({
            "date": day_date_str,
            "fromCity": carrier_info.get("fromCity", ""),
            "toCity": carrier_info.get("toCity", ""),
            "carrierName": carrier_info.get("carrierName", "Interstate Freight Logistics"),
            "mainOfficeAddress": carrier_info.get("mainOfficeAddress", "500 Logistics Parkway, Chicago, IL 60611"),
            "homeTerminalAddress": carrier_info.get("homeTerminalAddress", "Chicago Terminal #12, Chicago, IL"),
            "truckTractorNumber": carrier_info.get("truckTractorNumber", "TRK-905"),
            "trailerNumber": carrier_info.get("trailerNumber", "TRL-402"),
            "licensePlate": carrier_info.get("licensePlate", "IL 948-2831"),
            "odometerStart": carrier_info.get("odometerStart", 100000) + day_idx * 400,
            "odometerEnd": carrier_info.get("odometerStart", 100000) + (day_idx + 1) * 400,
            "totalMilesToday": 400,
            "shippingDocs": carrier_info.get("shippingDocs", "B/L 849201-X"),
            "manifestNumber": "",
            "shipper": carrier_info.get("shipper", "Midwest Distribution Co."),
            "commodity": carrier_info.get("commodity", "General Freight"),
            "driverSignatureName": carrier_info.get("driverName", "Alexander J. Mercer"),
            "driverSignatureDate": day_date_str,
            "intervals": day_intervals,
            "remarks": day_remarks,
            "recapDays": recap_days
        })
        
    return daily_logs
