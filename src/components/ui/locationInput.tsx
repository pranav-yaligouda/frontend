import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";

interface LocationInputProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

// This is a mock component. In a real app, you would integrate 
// with Google Maps or similar location service
const LocationInput = ({
  label,
  value = "",
  onChange,
  placeholder = "Enter your location",
  disabled = false,
}: LocationInputProps) => {
  const [address, setAddress] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Mock suggestions based on input
  useEffect(() => {
    if (address.length > 2) {
      // These would come from a real geocoding service
      const mockSuggestions = [
        `${address}, Main Street, Athani`,
        `${address}, Central Market, Athani`,
        `${address}, Station Road, Athani`,
        `${address}, Gandhi Nagar, Athani`,
      ];
      setSuggestions(mockSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [address]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setAddress(suggestion);
    onChange(suggestion);
    setShowSuggestions(false);
  };

  const handleCurrentLocation = () => {
    // Mock getting current location
    // In a real app, you would use the Geolocation API
    setAddress("Current Location, Athani");
    onChange("Current Location, Athani");
  };

  return (
    <div className="relative">
      {label && (
        <label className="block mb-2 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <MapPin className="w-5 h-5 text-gray-400" />
        </div>
        <Input
          type="text"
          value={address}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="pl-10"
          disabled={disabled}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        <button
          type="button"
          onClick={handleCurrentLocation}
          className="absolute inset-y-0 right-2 flex items-center text-sm text-primary"
          disabled={disabled}
        >
          Current
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full p-2 mt-1 overflow-auto bg-white border rounded-md shadow-lg max-h-60">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-2 py-1 text-sm cursor-pointer hover:bg-gray-100"
              onMouseDown={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationInput;
