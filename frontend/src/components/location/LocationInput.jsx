import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Card, CardContent } from '../ui/Card';
import { MapPin, Edit3, X } from 'lucide-react';
import LocationPicker from './LocationPicker';

/**
 * LocationInput Component
 * Form-friendly location input that integrates with LocationPicker
 * Provides GPS coordinates, region/district detection, and validation
 */
const LocationInput = ({
    value = {},
    onChange,
    onBlur,
    error,
    disabled = false,
    required = false,
    label = 'Location',
    placeholder = 'Click to select location on map',
    className = '',
    showMap = false,
    onMapToggle = null
}) => {
    const [isMapOpen, setIsMapOpen] = useState(showMap);
    const [tempLocation, setTempLocation] = useState(value || {
        latitude: '',
        longitude: '',
        region: '',
        district: '',
        address: '',
        coordinates: null
    });

    // Update tempLocation when value prop changes
    useEffect(() => {
        if (value) {
            setTempLocation(value);
        }
    }, [value]);

    // Handle location selection from map
    const handleLocationSelect = useCallback((location) => {
        setTempLocation(location);
        if (onChange) {
            onChange(location);
        }
    }, [onChange]);

    // Handle manual coordinate input
    const handleCoordinateChange = (field, value) => {
        const newLocation = {
            ...tempLocation,
            [field]: value
        };
        setTempLocation(newLocation);
        if (onChange) {
            onChange(newLocation);
        }
    };

    // Handle region/district input
    const handleRegionChange = (field, value) => {
        const newLocation = {
            ...tempLocation,
            [field]: value
        };
        setTempLocation(newLocation);
        if (onChange) {
            onChange(newLocation);
        }
    };

    // Open map picker
    const openMap = () => {
        setIsMapOpen(true);
        if (onMapToggle) {
            onMapToggle(true);
        }
    };

    // Close map picker
    const closeMap = () => {
        setIsMapOpen(false);
        if (onMapToggle) {
            onMapToggle(false);
        }
    };

    // Clear location
    const clearLocation = () => {
        const emptyLocation = {
            latitude: '',
            longitude: '',
            region: '',
            district: '',
            address: '',
            coordinates: null
        };
        setTempLocation(emptyLocation);
        if (onChange) {
            onChange(emptyLocation);
        }
    };

    // Format coordinates for display
    const formatCoordinates = (lat, lng) => {
        if (!lat || !lng) return 'Not set';
        return `${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)}`;
    };

    // Validate coordinates
    const validateCoordinates = (lat, lng) => {
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);
        return latNum >= -90 && latNum <= 90 && lngNum >= -180 && lngNum <= 180;
    };

    return (
        <div className={`space-y-3 ${className}`}>
            {/* Label */}
            {label && (
                <Label className="text-sm font-medium">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </Label>
            )}

            {/* Location Display Card */}
            <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                <CardContent className="p-4">
                    {/* Current Location Display */}
                    {tempLocation && (tempLocation.coordinates || (tempLocation.latitude && tempLocation.longitude)) ? (
                        <div className="space-y-3">
                            {/* Coordinates */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <MapPin className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium">GPS Coordinates</span>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={openMap}
                                    disabled={disabled}
                                    className="h-8 px-2"
                                >
                                    <Edit3 className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Latitude:</span>
                                        <span className="ml-2 font-mono">{tempLocation?.latitude || ''}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Longitude:</span>
                                        <span className="ml-2 font-mono">{tempLocation?.longitude || ''}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Region & District */}
                            {(tempLocation?.region || tempLocation?.district) && (
                                <div className="space-y-2">
                                    {tempLocation?.region && (
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-600">Region:</span>
                                            <span className="text-sm font-medium">{tempLocation.region}</span>
                                        </div>
                                    )}
                                    {tempLocation?.district && (
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-600">District:</span>
                                            <span className="text-sm font-medium">{tempLocation.district}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Address */}
                            {tempLocation?.address && (
                                <div className="pt-2 border-t border-gray-200">
                                    <span className="text-sm text-gray-600">Address:</span>
                                    <p className="text-sm font-medium mt-1">{tempLocation.address}</p>
                                </div>
                            )}

                            {/* Clear Button */}
                            <div className="flex justify-end pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={clearLocation}
                                    disabled={disabled}
                                    className="h-8 px-3"
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    Clear
                                </Button>
                            </div>
                        </div>
                    ) : (
                        /* No Location Set */
                        <div className="text-center py-6">
                            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm mb-3">{placeholder}</p>
                            <Button
                                type="button"
                                onClick={openMap}
                                disabled={disabled}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <MapPin className="h-4 w-4 mr-2" />
                                Select Location
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>



            {/* Map Picker Modal */}
            {isMapOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-auto max-h-[85vh] overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Location on Map</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Click on the map or search for a location</p>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={closeMap}
                                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="p-4">
                            <LocationPicker
                                onLocationSelect={handleLocationSelect}
                                initialLocation={tempLocation}
                                onClose={closeMap}
                                showControls={true}
                                showSearch={true}
                                showCoordinates={true}
                                showRegionDetection={true}
                                height="500px"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Error Display */}
            {error && typeof error === 'string' && (
                <p className="text-sm text-red-500">{error}</p>
            )}
        </div>
    );
};

export default LocationInput;
