def crime_risk_prediction_algorithm(lat, lon, time_of_day, weather, user_profile):
    """
    Crime Risk Prediction using CSV data + Contextual factors
    """
    # Step 1: Load and filter CSV crime data
    crime_data = load_csv_crime_data()
    nearby_crimes = []
    
    for crime in crime_data:
        # Haversine distance calculation
        distance = haversine_distance(lat, lon, crime.lat, crime.lon)
        if distance <= 2.0:  # 2km radius
            nearby_crimes.append(crime)
    
    # Step 2: Calculate CSV-based risk score
    if len(nearby_crimes) > 0:
        total_severity = sum(crime.severity for crime in nearby_crimes)
        crime_density = len(nearby_crimes) / 4.0  # 2km radius ≈ 4 km²
        csv_risk_score = max(1.0, 10.0 - (crime_density * 0.8) - (total_severity/len(nearby_crimes) - 5) * 0.4)
    else:
        csv_risk_score = 8.0  # Safe if no crimes
    
    # Step 3: Calculate contextual risk score
    contextual_score = 5.0  # Base score
    
    # Time adjustments
    time_adjustments = {"morning": 2, "afternoon": 1, "evening": -1, "night": -3}
    contextual_score += time_adjustments.get(time_of_day, 0)
    
    # Weather adjustments  
    weather_adjustments = {"clear": 1, "rain": -1.5, "storm": -2.5, "fog": -2}
    contextual_score += weather_adjustments.get(weather, 0)
    
    # User profile adjustments
    profile_adjustments = {"alone": -2, "with_friends": 1.5, "family": 2, "vehicle": 1}
    contextual_score += profile_adjustments.get(user_profile, 0)
    
    # Step 4: Combine scores (70% CSV + 30% Context)
    final_score = (csv_risk_score * 0.7) + (contextual_score * 0.3)
    final_score = max(1, min(10, final_score))
    
    # Step 5: Determine risk level
    if final_score >= 7:
        risk_level = "low"
    elif final_score >= 4:
        risk_level = "moderate"
    else:
        risk_level = "high"
    
    return {
        "risk_score": final_score,
        "risk_level": risk_level,
        "crime_count": len(nearby_crimes),
        "confidence": 0.85 if nearby_crimes else 0.6
    }

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two points in kilometers"""
    from math import radians, cos, sin, asin, sqrt
    
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    return c * 6371  # Earth radius in km
