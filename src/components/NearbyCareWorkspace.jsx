import React, { useState, useEffect } from "react";
import {
  MapPin,
  Hospital,
  Clock,
  Phone,
  Navigation,
  Star,
  Search,
  Crosshair,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Shield,
  Activity,
  UserCheck,
  Building2,
  Stethoscope,
} from "lucide-react";
import {
  getCurrentLocation,
  fetchNearbyMedicalFacilities,
} from "../services/nearbyCareService";
import { recordUserActivity } from "../services/db";

export default function NearbyCareWorkspace({ session }) {
  const [locationStatus, setLocationStatus] = useState("idle"); // 'idle' | 'detecting' | 'ready' | 'error'
  const [coordinates, setCoordinates] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all"); // 'all' | 'emergency' | 'clinics' | 'diagnostics'
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [facilitiesData, setFacilitiesData] = useState(null);

  // Auto-detect location on initial load
  useEffect(() => {
    handleDetectLocation();
  }, []);

  const handleDetectLocation = async () => {
    setLocationStatus("detecting");
    setErrorMessage("");
    setIsLoading(true);

    try {
      const coords = await getCurrentLocation();
      setCoordinates(coords);
      setLocationStatus("ready");

      const data = await fetchNearbyMedicalFacilities({
        latitude: coords.latitude,
        longitude: coords.longitude,
        category: activeCategory,
      });

      setFacilitiesData(data);
      recordUserActivity({
        email: session?.email,
        type: "care",
        title: `GPS Healthcare Locator: ${data.detectedArea || "Current Location"}`,
        summary: `Identified ${data.facilities?.length || 0} open hospitals and specialist centers near user GPS.`,
        data,
      });
    } catch (err) {
      console.warn("GPS detection note:", err);
      setLocationStatus("error");
      setErrorMessage(err.message || "Could not detect GPS coordinates. Please search manually by city or area.");

      // Load regional default if GPS is denied
      try {
        const fallbackData = await fetchNearbyMedicalFacilities({
          queryLocation: "Regional Medical District",
          category: activeCategory,
        });
        setFacilitiesData(fallbackData);
      } catch (e) {
        console.error("Fallback error:", e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await fetchNearbyMedicalFacilities({
        queryLocation: searchQuery.trim(),
        category: activeCategory,
      });
      setFacilitiesData(data);
      setLocationStatus("ready");
      recordUserActivity({
        email: session?.email,
        type: "care",
        title: `Nearby Care Search: "${searchQuery.trim()}"`,
        summary: `Found ${data.facilities?.length || 0} verified medical facilities and specialist doctors.`,
        data,
      });
    } catch (err) {
      setErrorMessage(err.message || "Failed to find medical facilities for this location.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = async (newCat) => {
    setActiveCategory(newCat);
    setIsLoading(true);

    try {
      const data = await fetchNearbyMedicalFacilities({
        latitude: coordinates?.latitude,
        longitude: coordinates?.longitude,
        queryLocation: searchQuery.trim() || undefined,
        category: newCat,
      });
      setFacilitiesData(data);
    } catch (err) {
      console.warn("Filter change error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter facilities based on active category
  const displayedFacilities = (facilitiesData?.facilities || []).filter((fac) => {
    if (activeCategory === "emergency") return fac.isEmergency;
    if (activeCategory === "clinics") return !fac.isEmergency && fac.type.toLowerCase().includes("clinic");
    if (activeCategory === "diagnostics") return fac.type.toLowerCase().includes("diagnostic") || fac.type.toLowerCase().includes("care");
    return true;
  });

  return (
    <div className="space-y-6 2xl:space-y-8 animate-fadeIn">
      {/* Workspace Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 2xl:p-10 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 text-[#0F766E] text-xs 2xl:text-sm font-bold font-mono uppercase mb-3 border border-teal-100">
              <MapPin className="w-4 h-4" />
              <span>Real-Time Healthcare Locator</span>
            </div>
            <h1 className="font-brand text-2xl sm:text-3xl 2xl:text-4xl font-bold text-[#0F2747] tracking-tight">
              Nearby Care & Doctors
            </h1>
            <p className="text-sm sm:text-base 2xl:text-lg text-slate-500 mt-1.5 max-w-3xl leading-relaxed">
              Find open verified hospitals, specialty clinics, and certified doctors near your real-time GPS location with live operating status.
            </p>
          </div>

          {/* Real-time Clock Badge */}
          {facilitiesData?.currentTime && (
            <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200/80 self-start sm:self-auto font-mono text-xs 2xl:text-sm text-[#0F2747]">
              <Clock className="w-4 h-4 text-[#0F766E]" />
              <span>Local Time: <strong className="font-bold">{facilitiesData.currentTime}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Location Bar: GPS Action + Manual Search */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 2xl:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* GPS Location Button */}
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isLoading && locationStatus === "detecting"}
            className="px-5 py-3 2xl:px-6 2xl:py-3.5 bg-teal-50 hover:bg-teal-100/80 text-[#0F766E] border border-teal-200/80 rounded-xl text-xs sm:text-sm 2xl:text-base font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-60 shadow-2xs"
          >
            {locationStatus === "detecting" ? (
              <>
                <span className="w-4 h-4 border-2 border-[#0F766E] border-t-transparent rounded-full animate-spin"></span>
                <span>Accessing GPS...</span>
              </>
            ) : (
              <>
                <Crosshair className="w-4 h-4 2xl:w-5 2xl:h-5 text-[#0F766E]" />
                <span>Use Current Live Location</span>
              </>
            )}
          </button>

          {/* Manual Location Search Bar */}
          <form onSubmit={handleManualSearch} className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Or search by city, neighborhood, or postal code..."
                className="w-full pl-10 pr-4 py-3 2xl:py-3.5 bg-slate-50 rounded-xl border border-slate-300 focus:border-[#0F766E] focus:bg-white text-xs sm:text-sm 2xl:text-base outline-none transition-all font-medium text-[#1E293B]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            <button
              type="submit"
              disabled={!searchQuery.trim() || isLoading}
              className="px-5 py-3 2xl:px-6 2xl:py-3.5 bg-[#0F2747] hover:bg-[#0A1B33] text-white rounded-xl text-xs sm:text-sm 2xl:text-base font-semibold transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
            >
              Search
            </button>
          </form>
        </div>

        {/* Status Notice */}
        {facilitiesData?.detectedArea && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs 2xl:text-sm text-slate-500 font-mono">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-600" />
              <span>Area: <strong className="text-[#0F2747]">{facilitiesData.detectedArea}</strong></span>
            </div>
            <span>{displayedFacilities.length} Verified Facilities Found</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1">
        {[
          { id: "all", label: "All Facilities", icon: Building2 },
          { id: "emergency", label: "24/7 Emergency Hospitals", icon: Hospital },
          { id: "clinics", label: "Specialist Clinics & Doctors", icon: Stethoscope },
          { id: "diagnostics", label: "Diagnostic Centers & Labs", icon: Activity },
        ].map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-4 py-2.5 2xl:px-5 2xl:py-3 rounded-xl text-xs sm:text-sm 2xl:text-base font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap border ${
                isActive
                  ? "bg-[#0F2747] text-white border-[#0F2747] shadow-xs"
                  : "bg-white text-[#1E293B] border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Facilities Grid */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-bold text-[#0F2747] text-sm sm:text-base">
            Searching Live Medical Facilities & Doctors...
          </p>
          <p className="text-xs text-slate-400">
            Checking real-time operating hours and clinical specialists.
          </p>
        </div>
      ) : displayedFacilities.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 2xl:gap-8">
          {displayedFacilities.map((facility) => {
            const mapsDirectionsUrl = facility.latitude && facility.longitude
              ? `https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`
              : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${facility.name}, ${facility.address}`)}`;

            const phoneSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${facility.name} ${facility.address} phone number`)}`;

            return (
              <div
                key={facility.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 2xl:p-8 shadow-xs flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all duration-200"
              >
                <div>
                  {/* Top Header: Name, Badge, Open/Closed Status */}
                  <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-slate-100 mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base sm:text-lg 2xl:text-xl text-[#0F2747]">
                          {facility.name}
                        </h3>
                        {facility.isEmergency && (
                          <span className="text-[10px] 2xl:text-xs font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                            24/7 Trauma
                          </span>
                        )}
                      </div>
                      <span className="text-xs 2xl:text-sm text-slate-500 font-medium block">
                        {facility.type}
                      </span>
                    </div>

                    {/* Live Open / Closed Badge */}
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs 2xl:text-sm font-bold font-mono flex-shrink-0 ${
                        facility.isOpenNow
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          facility.isOpenNow ? "bg-[#16A34A] animate-pulse" : "bg-slate-400"
                        }`}
                      ></span>
                      <span>{facility.hoursStatus}</span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-4 text-xs 2xl:text-sm text-slate-600 mb-3.5 font-mono">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{facility.rating}</span>
                      <span className="text-slate-400 font-normal">({facility.reviewCount}+ reviews)</span>
                    </div>
                  </div>

                  {/* Address & Hours */}
                  <div className="space-y-1.5 text-xs 2xl:text-sm text-slate-600 mb-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span>{facility.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span>{facility.operatingHours}</span>
                    </div>
                  </div>

                  {/* Verified Doctors & Specialists */}
                  {facility.doctors && facility.doctors.length > 0 && (
                    <div className="bg-slate-50/80 rounded-xl p-3.5 2xl:p-4 border border-slate-200/70 mb-4">
                      <span className="text-[11px] 2xl:text-xs font-bold text-slate-400 uppercase tracking-wider font-mono block mb-2 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-[#0F766E]" />
                        <span>Clinical Staff & Department</span>
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {facility.doctors.map((doc, idx) => (
                          <div key={idx} className="text-xs 2xl:text-sm">
                            <span className="font-bold text-[#0F2747] block">{doc.name}</span>
                            <span className="text-slate-500 text-[11px] 2xl:text-xs">
                              {doc.specialty} • {doc.experience}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Specialties Tag Badges */}
                  {facility.specialties && (
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {facility.specialties.map((spec, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] 2xl:text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-mono font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  {facility.phone ? (
                    <a
                      href={`tel:${facility.phone.replace(/[^0-9+]/g, "")}`}
                      className="px-4 py-2.5 2xl:px-5 2xl:py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-[#0F2747] text-xs 2xl:text-sm font-semibold flex items-center gap-2 transition-colors"
                      title="Call Phone Number"
                    >
                      <Phone className="w-3.5 h-3.5 text-teal-600" />
                      <span>{facility.phone}</span>
                    </a>
                  ) : (
                    <a
                      href={phoneSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs 2xl:text-sm font-medium flex items-center gap-1.5 transition-colors"
                      title="Look up hospital desk phone"
                    >
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>Hospital Desk</span>
                    </a>
                  )}

                  <a
                    href={mapsDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 2xl:px-6 2xl:py-3 bg-[#0F2747] hover:bg-[#0A1B33] text-white text-xs 2xl:text-sm font-semibold rounded-xl flex items-center gap-2 transition-all shadow-xs"
                  >
                    <span>Get Directions</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <p className="font-bold text-[#0F2747] text-sm sm:text-base">
            No medical facilities found for this category.
          </p>
          <p className="text-xs text-slate-400">
            Try switching to "All Facilities" or searching a different area.
          </p>
        </div>
      )}
    </div>
  );
}
