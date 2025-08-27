import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin,
    Search,
    Target,
    Navigation,
    Layers,
    Crosshair,
    CheckCircle,
    AlertCircle,
    Loader,
    Map as MapIcon,
    Satellite,
    Mountain,
    X,
    RefreshCw,
    Maximize,
    Minimize,
    Info
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import L from 'leaflet';

// Fix for default marker icons in Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Rwanda geographical data - More precise bounds
const RWANDA_BOUNDS = [
    [-2.85, 28.85], // Southwest (more precise)
    [-1.13, 30.90]  // Northeast (more precise)
];

const RWANDA_CENTER = [-1.9441, 30.0619]; // Kigali

const RWANDA_PROVINCES = [
    {
        name: 'Kigali City',
        code: 'kigali',
        center: [-1.9441, 30.0619],
        districts: ['Gasabo', 'Kicukiro', 'Nyarugenge']
    },
    {
        name: 'Northern Province',
        code: 'northern',
        center: [-1.6, 29.8],
        districts: ['Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo']
    },
    {
        name: 'Southern Province',
        code: 'southern',
        center: [-2.3, 29.7],
        districts: ['Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango']
    },
    {
        name: 'Eastern Province',
        code: 'eastern',
        center: [-2.0, 30.7],
        districts: ['Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana']
    },
    {
        name: 'Western Province',
        code: 'western',
        center: [-2.2, 29.2],
        districts: ['Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro']
    }
];

// Map layer configurations - Multiple tile servers for better reliability
const MAP_LAYERS = {
    // Primary options - Most reliable
    cartodb: {
        name: 'CartoDB Light',
        url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        attribution: '&copy; CartoDB',
        icon: MapIcon,
        subdomains: ['a', 'b', 'c', 'd']
    },
    cartodb_dark: {
        name: 'CartoDB Dark',
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        attribution: '&copy; CartoDB',
        icon: MapIcon,
        subdomains: ['a', 'b', 'c', 'd']
    },
    // Alternative OpenStreetMap providers
    openstreetmap: {
        name: 'OpenStreetMap',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap contributors',
        icon: MapIcon,
        subdomains: ['a', 'b', 'c']
    },
    openstreetmap_alt: {
        name: 'OpenStreetMap (Alt)',
        url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}.png',
        attribution: '&copy; Stadia Maps, &copy; OpenMapTiles, &copy; OpenStreetMap contributors',
        icon: MapIcon,
        subdomains: []
    },
    // Additional reliable providers
    jawg: {
        name: 'Jawg Maps',
        url: 'https://{s}.tile.jawg.io/jawg-streets/{z}/{x}/{y}.png?access-token=your-access-token',
        attribution: '&copy; Jawg Maps',
        icon: MapIcon,
        subdomains: ['a', 'b', 'c', 'd']
    },
    // Satellite and terrain (may be less reliable)
    satellite: {
        name: 'Satellite',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; Esri, Maxar, GeoEye',
        icon: Satellite,
        subdomains: []
    },
    terrain: {
        name: 'Terrain',
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: '&copy; OpenTopoMap contributors',
        icon: Mountain,
        subdomains: ['a', 'b', 'c']
    }
};

// Custom marker icon for heritage sites
const createCustomIcon = (color = '#3B82F6') => {
    return new L.Icon({
        iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.164 0 0 7.164 0 16C0 24 16 40 16 40S32 24 32 16C32 7.164 24.836 0 16 0Z" fill="${color}"/>
        <circle cx="16" cy="16" r="8" fill="white"/>
        <circle cx="16" cy="16" r="4" fill="${color}"/>
      </svg>
    `)}`,
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -40]
    });
};

// Component to handle map events
const MapEventHandler = ({ onLocationSelect, crosshairMode }) => {
    const map = useMapEvents({
        click: (e) => {
            // Always allow clicking to select location, but show crosshair when in precise mode
            if (onLocationSelect) {
                onLocationSelect({
                    lat: e.latlng.lat,
                    lng: e.latlng.lng
                });
            }
        },
        dblclick: (e) => {
            // Prevent double-click zoom when selecting location
            e.originalEvent.preventDefault();
        },
        contextmenu: (e) => {
            // Prevent right-click context menu
            e.originalEvent.preventDefault();
        }
    });

    return null;
};

// Component to update map view
const MapUpdater = ({ center, zoom }) => {
    const map = useMap();

    useEffect(() => {
        if (center) {
            map.setView(center, zoom || map.getZoom());
        }
    }, [center, zoom, map]);

    return null;
};

const LocationPicker = ({
    value = null,
    onChange,
    onLocationSelect,
    disabled = false,
    showSearch = true,
    showProvinces = true,
    showFullscreen = true,
    defaultZoom = 8,
    minZoom = 6,
    maxZoom = 18,
    height = '400px',
    className = '',
    ...props
}) => {
    // State management
    const [selectedLocation, setSelectedLocation] = useState(value);
    const [mapCenter, setMapCenter] = useState(value ? [value.latitude || value.lat, value.longitude || value.lng] : RWANDA_CENTER);
    const [mapZoom, setMapZoom] = useState(9); // Start with a better zoom level for Rwanda
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [currentLayer, setCurrentLayer] = useState('cartodb');
    const [crosshairMode, setCrosshairMode] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [gettingLocation, setGettingLocation] = useState(false);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [locationInfo, setLocationInfo] = useState(null);
    const [mapLoading, setMapLoading] = useState(true);
    const [tileError, setTileError] = useState(false);

    const mapRef = useRef(null);
    const searchTimeoutRef = useRef(null);

    // Update selected location when value prop changes
    useEffect(() => {
        if (value && value !== selectedLocation) {
            setSelectedLocation(value);
            setMapCenter([value.latitude || value.lat, value.longitude || value.lng]);
        }
    }, [value, selectedLocation]);

    // Initialize map to Rwanda view
    useEffect(() => {
        setMapCenter(RWANDA_CENTER);
        setMapZoom(9);
    }, []);

    // Ensure proper map sizing on mount and after render
    useEffect(() => {
        const timer = setTimeout(() => {
            if (mapRef.current) {
                const map = mapRef.current;

                // Force initial sizing
                map.invalidateSize();

                // Ensure container fills parent
                const container = map.getContainer();
                if (container) {
                    container.style.width = '100%';
                    container.style.height = '100%';
                    container.style.minHeight = '500px';
                }

                // Set proper bounds
                map.fitBounds(RWANDA_BOUNDS, { padding: [20, 20] });
            }
        }, 200);

        return () => clearTimeout(timer);
    }, []);

    // Handle map resizing and ensure proper container sizing
    useEffect(() => {
        if (mapRef.current) {
            const map = mapRef.current;

            // Force map to invalidate size and redraw
            setTimeout(() => {
                map.invalidateSize();
                map.fitBounds(RWANDA_BOUNDS, { padding: [20, 20] });

                // Additional resize handling
                const container = map.getContainer();
                if (container) {
                    container.style.width = '100%';
                    container.style.height = '100%';
                    container.style.minHeight = '500px';
                }
            }, 100);
        }
    }, [currentLayer, fullscreen]);

    // Add resize observer to handle container size changes
    useEffect(() => {
        if (!mapRef.current) return;

        const map = mapRef.current;
        const resizeObserver = new ResizeObserver((entries) => {
            entries.forEach(() => {
                setTimeout(() => {
                    map.invalidateSize();

                    // Force container sizing
                    const container = map.getContainer();
                    if (container) {
                        container.style.width = '100%';
                        container.style.height = '100%';
                        container.style.minHeight = '500px';
                    }
                }, 50);
            });
        });

        const mapContainer = map.getContainer();
        if (mapContainer) {
            resizeObserver.observe(mapContainer);
        }

        // Also observe the parent container for size changes
        const parentContainer = mapContainer?.parentElement;
        if (parentContainer) {
            resizeObserver.observe(parentContainer);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    // Update selected location when locationInfo changes
    useEffect(() => {
        if (selectedLocation && locationInfo && onChange) {
            const updatedLocation = {
                ...selectedLocation,
                region: locationInfo.province || '',
                district: locationInfo.district || ''
            };

            // Update the selected location with province/district info
            setSelectedLocation(updatedLocation);

            // Notify parent components of the updated location
            onChange(updatedLocation);
        }
    }, [locationInfo, selectedLocation, onChange]);

    // Reverse geocoding to get location info using local Rwanda data
    const getLocationInfo = useCallback(async (lat, lng) => {
        try {
            // Use local Rwanda province detection instead of external API
            const province = RWANDA_PROVINCES.find(p => {
                const distance = Math.sqrt(
                    Math.pow(p.center[0] - lat, 2) + Math.pow(p.center[1] - lng, 2)
                );
                return distance < 1; // Rough proximity check
            });

            const locationInfo = {
                province: province?.name || 'Unknown Province',
                district: 'Auto-detected District',
                coordinates: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
            };

            setLocationInfo(locationInfo);
            return locationInfo;
        } catch (error) {
            console.error('Failed to get location info:', error);
            // Fallback
            const fallbackInfo = {
                province: 'Unknown Province',
                district: 'Auto-detected District',
                coordinates: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
            };
            setLocationInfo(fallbackInfo);
            return fallbackInfo;
        }
    }, []);

    // Handle location selection
    const handleLocationSelect = useCallback(async (location) => {
        // First get location information
        await getLocationInfo(location.lat, location.lng);

        const newLocation = {
            latitude: parseFloat(location.lat.toFixed(6)),
            longitude: parseFloat(location.lng.toFixed(6)),
            coordinates: `${parseFloat(location.lat.toFixed(6))}, ${parseFloat(location.lng.toFixed(6))}`,
            region: '', // Will be updated after getLocationInfo
            district: '', // Will be updated after getLocationInfo
            address: ''
        };

        setSelectedLocation(newLocation);
        setMapCenter([newLocation.latitude, newLocation.longitude]);
        setMapZoom(14); // Zoom in closer for better precision

        // Update location with province/district info from the updated locationInfo
        const updatedLocation = {
            ...newLocation,
            region: '', // Will be populated by the next render cycle
            district: '' // Will be populated by the next render cycle
        };

        // Notify parent components
        if (onChange) {
            onChange(updatedLocation);
        }
        if (onLocationSelect) {
            onLocationSelect(updatedLocation);
        }

        // Exit crosshair mode after selection
        setCrosshairMode(false);
    }, [onChange, onLocationSelect, getLocationInfo]);

    // Search for locations using local Rwanda data
    const handleSearch = useCallback(async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setSearching(true);

        try {
            // Use local Rwanda data for search instead of external API
            const searchQuery = query.toLowerCase();
            const results = [];

            // Search in provinces
            RWANDA_PROVINCES.forEach(province => {
                if (province.name.toLowerCase().includes(searchQuery)) {
                    results.push({
                        name: province.name,
                        type: 'Province',
                        lat: province.center[0],
                        lng: province.center[1],
                        displayName: `${province.name} Province`
                    });
                }
            });

            // Search in major cities (you can expand this list)
            const majorCities = [
                { name: 'Kigali', lat: -1.9441, lng: 30.0619, type: 'City' },
                { name: 'Butare', lat: -2.5967, lng: 29.7374, type: 'City' },
                { name: 'Gisenyi', lat: -1.7028, lng: 29.2564, type: 'City' },
                { name: 'Ruhengeri', lat: -1.4998, lng: 29.6344, type: 'City' },
                { name: 'Nyanza', lat: -2.3515, lng: 29.7500, type: 'City' },
                { name: 'Kibuye', lat: -2.0597, lng: 29.3478, type: 'City' },
                { name: 'Cyangugu', lat: -2.4791, lng: 28.9075, type: 'City' },
                { name: 'Kibungo', lat: -2.1597, lng: 30.5419, type: 'City' }
            ];

            majorCities.forEach(city => {
                if (city.name.toLowerCase().includes(searchQuery)) {
                    results.push({
                        name: city.name,
                        type: city.type,
                        lat: city.lat,
                        lng: city.lng,
                        displayName: `${city.name} (${city.type})`
                    });
                }
            });

            setSearchResults(results);
        } catch (error) {
            console.error('Failed to search locations:', error);
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    }, []);

    // Debounced search
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            handleSearch(searchQuery);
        }, 300);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery, handleSearch]);

    // Get user's current location
    const getCurrentLocation = useCallback(() => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by this browser.');
            return;
        }

        setGettingLocation(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                handleLocationSelect(location);
                setMapZoom(14);
                setGettingLocation(false);
            },
            (error) => {
                console.error('Error getting current location:', error);
                alert('Unable to get your current location.');
                setGettingLocation(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            }
        );
    }, [handleLocationSelect]);

    // Handle province selection
    const handleProvinceSelect = (province) => {
        setSelectedProvince(province);
        setMapCenter(province.center);
        setMapZoom(11); // Zoom in more for better detail

        // Add a temporary highlight effect
        setTimeout(() => {
            setSelectedProvince(null);
        }, 2000);
    };

    // Clear selection
    const clearSelection = () => {
        setSelectedLocation(null);
        setLocationInfo(null);
        if (onChange) {
            onChange(null);
        }
    };

    // Handle tile layer switching with fallback
    const handleLayerChange = (newLayer) => {
        setCurrentLayer(newLayer);
        setTileError(false);
        setMapLoading(true);
    };

    // Handle fullscreen toggle with proper map resizing
    const handleFullscreenToggle = () => {
        const newFullscreen = !fullscreen;
        setFullscreen(newFullscreen);

        // Force map resize after fullscreen change
        setTimeout(() => {
            if (mapRef.current) {
                mapRef.current.invalidateSize();
            }
        }, 100);
    };

    // Try fallback layer if current one fails
    const tryFallbackLayer = () => {
        // Priority order: CartoDB (most reliable) -> OpenStreetMap -> Alternatives
        const fallbackOrder = ['cartodb', 'cartodb_dark', 'openstreetmap', 'openstreetmap_alt', 'jawg'];
        const currentIndex = fallbackOrder.indexOf(currentLayer);
        const nextIndex = (currentIndex + 1) % fallbackOrder.length;
        const nextLayer = fallbackOrder[nextIndex];

        console.log(`Switching from ${currentLayer} to ${nextLayer} due to tile loading failure`);
        handleLayerChange(nextLayer);
    };

    return (
        <div className={`space-y-3 ${className}`} {...props}>
            {/* Header Controls - Compact */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        Select Location
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        Click on the map or search for a location
                    </p>
                    {tileError && (
                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                            💡 Map tiles not loading? Try switching map type using the dropdown above
                        </p>
                    )}
                </div>

                <div className="flex items-center space-x-2">
                    {/* Current Location Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={getCurrentLocation}
                        disabled={gettingLocation || disabled}
                        className="flex items-center space-x-1 h-8 px-2"
                        title="Get your current location"
                    >
                        {gettingLocation ? (
                            <Loader className="w-3 h-3 animate-spin" />
                        ) : (
                            <Navigation className="w-3 h-3" />
                        )}
                        <span className="text-xs">{gettingLocation ? 'Getting...' : 'My Location'}</span>
                    </Button>

                    {/* Crosshair Mode Toggle */}
                    <Button
                        variant={crosshairMode ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCrosshairMode(!crosshairMode)}
                        disabled={disabled}
                        className="flex items-center space-x-1 h-8 px-2"
                        title={crosshairMode ? "Exit precise mode" : "Enable precise mode with crosshair"}
                    >
                        <Crosshair className="w-3 h-3" />
                        <span className="text-xs">{crosshairMode ? 'Precise ON' : 'Precise'}</span>
                    </Button>

                    {/* Fullscreen Toggle */}
                    {showFullscreen && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleFullscreenToggle}
                            className="flex items-center space-x-1 h-8 px-2"
                            title="Toggle fullscreen"
                        >
                            {fullscreen ? <Minimize className="w-3 h-3" /> : <Maximize className="w-3 h-3" />}
                        </Button>
                    )}
                </div>
            </div>

            {/* Search Bar - Compact */}
            {showSearch && (
                <div className="relative">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search for cities or provinces (e.g., Nyanza, Kigali)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            disabled={disabled}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        />
                        {searching && (
                            <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                        )}
                    </div>

                    {/* Search Results */}
                    <AnimatePresence>
                        {searchResults.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
                            >
                                {searchResults.map((result, index) => (
                                    <button
                                        key={`${result.name}-${index}`}
                                        onClick={() => handleLocationSelect({ lat: result.lat, lng: result.lng })}
                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
                                    >
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {result.displayName || result.name}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {result.type} • {result.lat.toFixed(4)}, {result.lng.toFixed(4)}
                                        </div>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Province Quick Select - Compact */}
            {showProvinces && (
                <div className="flex flex-wrap gap-1">
                    {RWANDA_PROVINCES.map((province) => (
                        <Button
                            key={province.code}
                            variant={selectedProvince?.code === province.code ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleProvinceSelect(province)}
                            disabled={disabled}
                            className="text-xs px-2 py-1 h-7"
                        >
                            {province.name}
                        </Button>
                    ))}
                </div>
            )}

            {/* Map Container */}
            <Card className={fullscreen ? 'fixed inset-4 z-50' : ''}>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>Interactive Map</span>
                        </CardTitle>

                        <div className="flex items-center space-x-2">
                            {/* Layer Selector */}
                            <div className="flex items-center space-x-2">
                                <select
                                    value={currentLayer}
                                    onChange={(e) => handleLayerChange(e.target.value)}
                                    disabled={disabled}
                                    className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                >
                                    {Object.entries(MAP_LAYERS).map(([key, layer]) => (
                                        <option key={key} value={key}>
                                            {layer.name}
                                        </option>
                                    ))}
                                </select>

                                {/* Tile Error Indicator */}
                                {tileError && (
                                    <div className="flex items-center space-x-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={tryFallbackLayer}
                                            className="text-xs h-7 px-2 text-orange-600 border-orange-300 hover:bg-orange-50"
                                            title="Tile loading failed, click to try alternative map"
                                        >
                                            <RefreshCw className="w-3 h-3 mr-1" />
                                            Switch Map
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleLayerChange(currentLayer)}
                                            className="text-xs h-7 px-2 text-blue-600 border-blue-300 hover:bg-blue-50"
                                            title="Retry current map type"
                                        >
                                            <RefreshCw className="w-3 h-3 mr-1" />
                                            Retry
                                        </Button>
                                    </div>
                                )}

                                {/* Map Resize Button */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        if (mapRef.current) {
                                            const map = mapRef.current;

                                            // Force complete resize
                                            map.invalidateSize();

                                            // Force container sizing
                                            const container = map.getContainer();
                                            if (container) {
                                                container.style.width = '100%';
                                                container.style.height = '100%';
                                                container.style.minHeight = '500px';
                                            }

                                            // Force bounds update
                                            setTimeout(() => {
                                                map.fitBounds(RWANDA_BOUNDS, { padding: [20, 20] });
                                                map.invalidateSize();
                                            }, 100);
                                        }
                                    }}
                                    className="text-xs h-7 px-2 text-green-600 border-green-300 hover:bg-green-50"
                                    title="Force map to resize and fill container"
                                >
                                    <Maximize className="w-3 h-3 mr-1" />
                                    Force Resize
                                </Button>
                            </div>

                            {/* Clear Selection */}
                            {selectedLocation && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearSelection}
                                    disabled={disabled}
                                    className="text-xs h-7 px-2"
                                >
                                    <X className="w-3 h-3 mr-1" />
                                    Clear
                                </Button>
                            )}

                            {/* Close Fullscreen */}
                            {fullscreen && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setFullscreen(false)}
                                    className="h-7 px-2"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div
                        style={{
                            height: fullscreen ? 'calc(100vh - 200px)' : '600px',
                            minHeight: '500px',
                            width: '100%'
                        }}
                        className={`relative ${crosshairMode ? 'cursor-crosshair' : ''} w-full overflow-hidden flex flex-col`}
                    >
                        <MapContainer
                            ref={mapRef}
                            center={mapCenter}
                            zoom={mapZoom}
                            style={{
                                width: '100%',
                                height: '100%',
                                minHeight: '500px'
                            }}
                            maxBounds={RWANDA_BOUNDS}
                            maxBoundsViscosity={0.3}
                            minZoom={7}
                            maxZoom={18}
                            zoomControl={true}
                            doubleClickZoom={true}
                            scrollWheelZoom={true}
                            dragging={true}
                            touchZoom={true}
                            className="rounded-b-lg w-full h-full"
                            zoomSnap={0.1}
                            zoomDelta={0.5}
                            whenCreated={(map) => {
                                // Ensure map fills container when created
                                setTimeout(() => {
                                    map.invalidateSize();
                                    // Force proper sizing
                                    map.fitBounds(RWANDA_BOUNDS, { padding: [20, 20] });
                                }, 100);
                            }}
                        >
                            <TileLayer
                                key={currentLayer} // Force re-render when layer changes
                                url={MAP_LAYERS[currentLayer].url}
                                attribution={MAP_LAYERS[currentLayer].attribution}
                                subdomains={MAP_LAYERS[currentLayer].subdomains}
                                eventHandlers={{
                                    loading: () => {
                                        console.log(`Loading ${currentLayer} tiles...`);
                                        setMapLoading(true);
                                        setTileError(false);
                                    },
                                    load: () => {
                                        console.log(`${currentLayer} tiles loaded successfully`);
                                        setMapLoading(false);
                                        setTileError(false);
                                    },
                                    error: () => {
                                        console.warn(`Failed to load ${currentLayer} tiles, trying fallback...`);
                                        setMapLoading(false);
                                        setTileError(true);
                                        // Try to switch to a more reliable layer if current one fails
                                        setTimeout(() => tryFallbackLayer(), 1500);
                                    }
                                }}
                                maxZoom={18}
                                minZoom={1}
                                updateWhenZooming={false}
                                updateWhenIdle={true}
                            />

                            <MapEventHandler
                                onLocationSelect={handleLocationSelect}
                                crosshairMode={crosshairMode}
                            />

                            <MapUpdater center={mapCenter} zoom={mapZoom} />

                            {/* Zoom to Rwanda Button */}
                            <div className="absolute top-4 right-4 z-[1000]">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setMapCenter(RWANDA_CENTER);
                                        setMapZoom(8);
                                        setSelectedProvince(null);
                                    }}
                                    className="bg-white dark:bg-gray-800 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                                    title="Reset to Rwanda view"
                                >
                                    <MapIcon className="w-4 h-4 mr-1" />
                                    Rwanda
                                </Button>
                            </div>

                            {/* Selected Location Marker */}
                            {selectedLocation && (
                                <Marker
                                    position={[selectedLocation.latitude || selectedLocation.lat, selectedLocation.longitude || selectedLocation.lng]}
                                    icon={createCustomIcon('#10B981')}
                                >
                                    <Popup>
                                        <div className="text-center">
                                            <strong>Selected Location</strong>
                                            <br />
                                            {(selectedLocation.latitude || selectedLocation.lat).toFixed(6)}, {(selectedLocation.longitude || selectedLocation.lng).toFixed(6)}
                                            {locationInfo && locationInfo.province && (
                                                <>
                                                    <br />
                                                    <small>{locationInfo.province}</small>
                                                </>
                                            )}
                                        </div>
                                    </Popup>
                                </Marker>
                            )}

                            {/* Province Centers */}
                            {showProvinces && mapZoom <= 9 && RWANDA_PROVINCES.map((province) => (
                                <Marker
                                    key={province.code}
                                    position={province.center}
                                    icon={createCustomIcon('#6B7280')}
                                >
                                    <Popup>
                                        <div className="text-center">
                                            <strong>{province.name}</strong>
                                            <br />
                                            <small>Click to zoom in</small>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>

                        {/* Map Loading Overlay */}
                        {mapLoading && (
                            <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-75 flex items-center justify-center z-10">
                                <div className="text-center">
                                    <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Loading {MAP_LAYERS[currentLayer].name}...
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                        If tiles don't load, try switching map type
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Tile Error Overlay */}
                        {tileError && !mapLoading && (
                            <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-75 flex items-center justify-center z-10">
                                <div className="text-center max-w-sm mx-auto p-4">
                                    <AlertCircle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">
                                        Map tiles failed to load
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                                        This usually happens due to network restrictions or tile server issues. Try switching to a different map type.
                                    </p>
                                    <div className="flex flex-col space-y-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={tryFallbackLayer}
                                            className="text-xs"
                                        >
                                            <RefreshCw className="w-3 h-3 mr-1" />
                                            Switch to Alternative Map
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleLayerChange('cartodb')}
                                            className="text-xs text-blue-600"
                                        >
                                            Try CartoDB (Most Reliable)
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Crosshair Overlay */}
                        {crosshairMode && (
                            <div className="absolute inset-0 pointer-events-none">
                                {/* Vertical line */}
                                <div className="absolute left-1/2 top-0 w-0.5 h-full bg-red-500 transform -translate-x-1/2"></div>
                                {/* Horizontal line */}
                                <div className="absolute top-1/2 left-0 h-0.5 w-full bg-red-500 transform -translate-y-1/2"></div>
                                {/* Center circle */}
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    <div className="w-6 h-6 border-2 border-red-500 rounded-full bg-red-500 bg-opacity-20"></div>
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full"></div>
                                </div>
                            </div>
                        )}

                        {/* Instructions */}
                        <AnimatePresence>
                            {crosshairMode ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="absolute bottom-4 left-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg text-sm text-center font-medium shadow-lg"
                                >
                                    🎯 Precise Mode: Click anywhere to select exact coordinates
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="absolute bottom-4 left-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm text-center font-medium shadow-lg"
                                >
                                    📍 Click anywhere on the map to select location • Use scroll wheel to zoom • Drag to pan
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </CardContent>
            </Card>

            {/* Selected Location Info - Compact */}
            <AnimatePresence>
                {selectedLocation && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <Card>
                            <CardContent className="p-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-2">
                                        <div className="w-6 h-6 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <CheckCircle className="w-3 h-3 text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                                Location Selected
                                            </h4>
                                            <div className="space-y-0.5 text-xs text-gray-600 dark:text-gray-400">
                                                <div>
                                                    <strong>Coordinates:</strong> {selectedLocation.latitude?.toFixed(6) || selectedLocation.lat?.toFixed(6)}, {selectedLocation.longitude?.toFixed(6) || selectedLocation.lng?.toFixed(6)}
                                                </div>
                                                {locationInfo && locationInfo.province && (
                                                    <>
                                                        <div>
                                                            <strong>Province:</strong> {locationInfo.province}
                                                        </div>
                                                        <div>
                                                            <strong>District:</strong> {locationInfo.district}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearSelection}
                                        disabled={disabled}
                                        className="h-7 w-7 p-0"
                                    >
                                        <X className="w-3 h-3" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Click outside to close search results */}
            {searchResults.length > 0 && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setSearchResults([])}
                />
            )}
        </div>
    );
};

export default LocationPicker;





