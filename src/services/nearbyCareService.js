/**
 * Vital Nearby Care & Medical Facilities Service
 * Handles browser geolocation and backend API calls for real-time hospitals and doctors.
 */

/**
 * Get current browser GPS coordinates
 */
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser. Please search by city name."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let msg = "Location permission was denied or unavailable.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "Location permission denied. Please enter your city or area manually.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = "Location information is currently unavailable.";
        } else if (error.code === error.TIMEOUT) {
          msg = "Location request timed out. Please try again or search manually.";
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

/**
 * Fetch nearby hospitals and doctors from backend
 */
export async function fetchNearbyMedicalFacilities({ latitude, longitude, queryLocation, category = "all" }) {
  const response = await fetch("/api/nearby-medical-facilities", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      latitude,
      longitude,
      queryLocation,
      category,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch nearby medical facilities (HTTP ${response.status})`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || "Failed to retrieve facilities data.");
  }

  return result.data;
}
