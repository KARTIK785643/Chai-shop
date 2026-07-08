import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './AddShopPage.css';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const AddShopPage = () => {
  const { addShop } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);

  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const ignoreNextFetchRef = useRef(false);

  
  useEffect(() => {
    if (!mapRef.current) return;

    
    const initialLat = 37.7749;
    const initialLng = -122.4194;

    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView([initialLat, initialLng], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;

      
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        setLatitude(lat.toFixed(6));
        setLongitude(lng.toFixed(6));

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
          marker.on('dragend', (ev) => {
            const pos = ev.target.getLatLng();
            setLatitude(pos.lat.toFixed(6));
            setLongitude(pos.lng.toFixed(6));
          });
          markerRef.current = marker;
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  
  useEffect(() => {
    if (ignoreNextFetchRef.current) {
      ignoreNextFetchRef.current = false;
      return;
    }

    if (!address.trim() || address.length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=5`
        );
        const data = await response.json();
        setSuggestions(data);
        setShowDropdown(true);
      } catch (err) {
        console.error("Geocoding lookup error:", err);
      } finally {
        setSearching(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [address]);

  
  const handleSelectSuggestion = (item) => {
    ignoreNextFetchRef.current = true;
    setAddress(item.display_name);
    setLatitude(parseFloat(item.lat).toFixed(6));
    setLongitude(parseFloat(item.lon).toFixed(6));

    
    if (mapInstanceRef.current) {
      const latVal = parseFloat(item.lat);
      const lngVal = parseFloat(item.lon);
      mapInstanceRef.current.setView([latVal, lngVal], 15);

      if (markerRef.current) {
        markerRef.current.setLatLng([latVal, lngVal]);
      } else {
        const marker = L.marker([latVal, lngVal], { draggable: true }).addTo(mapInstanceRef.current);
        marker.on('dragend', (ev) => {
          const pos = ev.target.getLatLng();
          setLatitude(pos.lat.toFixed(6));
          setLongitude(pos.lng.toFixed(6));
        });
        markerRef.current = marker;
      }
    }

    setSuggestions([]);
    setShowDropdown(false);
  };

  
  const updateMarkerFromInputs = () => {
    if (mapInstanceRef.current && latitude && longitude) {
      const latVal = parseFloat(latitude);
      const lngVal = parseFloat(longitude);
      if (!isNaN(latVal) && !isNaN(lngVal) && latVal >= -90 && latVal <= 90 && lngVal >= -180 && lngVal <= 180) {
        if (markerRef.current) {
          markerRef.current.setLatLng([latVal, lngVal]);
        } else {
          const marker = L.marker([latVal, lngVal], { draggable: true }).addTo(mapInstanceRef.current);
          marker.on('dragend', (ev) => {
            const pos = ev.target.getLatLng();
            setLatitude(pos.lat.toFixed(6));
            setLongitude(pos.lng.toFixed(6));
          });
          markerRef.current = marker;
        }
        mapInstanceRef.current.panTo([latVal, lngVal]);
      }
    }
  };

  const validateForm = () => {
    if (!name.trim()) {
      setError('Shop name is required.');
      return false;
    }
    if (!address.trim()) {
      setError('Address is required.');
      return false;
    }
    if (!description.trim()) {
      setError('Shop description is required.');
      return false;
    }
    if (!latitude.trim() || isNaN(parseFloat(latitude)) || parseFloat(latitude) < -90 || parseFloat(latitude) > 90) {
      setError('Please select or enter a valid Latitude (-90 to 90).');
      return false;
    }
    if (!longitude.trim() || isNaN(parseFloat(longitude)) || parseFloat(longitude) < -180 || parseFloat(longitude) > 180) {
      setError('Please select or enter a valid Longitude (-180 to 180).');
      return false;
    }
    if (photoUrl.trim() && !photoUrl.trim().startsWith('http://') && !photoUrl.trim().startsWith('https://')) {
      setError('Photo URL must begin with http:// or https://');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const newShop = await addShop({
        name,
        address,
        description,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        photoUrl: photoUrl.trim() || undefined
      });

      if (newShop) {
        setSuccess('Chai shop added successfully!');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setError('Failed to add chai shop. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="add-shop-page container fade-in">
      <div className="add-shop-card card">
        <div className="add-shop-header">
          <h2>Add a New Chai Spot</h2>
          <p>Discovered a hidden gem? Share it with the community and earn <strong>15 reward points</strong>!</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="add-shop-form" autoComplete="off">
          <div className="form-group">
            <label htmlFor="shop-name">Shop Name *</label>
            <input
              type="text"
              id="shop-name"
              className="form-control"
              placeholder="e.g. Chai Tapri Express"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group" style={{ position: 'relative' }}>
            <label htmlFor="shop-address">Street Address *</label>
            <input
              type="text"
              id="shop-address"
              className="form-control"
              placeholder="Start typing address (e.g. 1045 Mission St, San Francisco...)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={loading}
              required
              autoComplete="off"
            />
            {searching && <span className="address-loading-spinner">🔍 Searching...</span>}

            {showDropdown && suggestions.length > 0 && (
              <ul className="address-suggestions-dropdown">
                {suggestions.map((item, idx) => (
                  <li
                    key={idx}
                    className="suggestion-item"
                    onClick={() => handleSelectSuggestion(item)}
                  >
                    <span className="suggestion-marker-icon">📍</span>
                    <span className="suggestion-text">{item.display_name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {}
          <div className="form-group">
            <label>Select Location on Map *</label>
            <div 
              ref={mapRef} 
              style={{ 
                width: '100%', 
                height: '260px', 
                borderRadius: '8px', 
                border: '1.5px solid var(--border-color)', 
                marginBottom: '5px',
                zIndex: 1
              }} 
            />
            <small className="form-help-text" style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>
              Click anywhere on the map to place a pin, or drag it to refine your spot.
            </small>
          </div>

          <div className="coordinates-form-row" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
              <label htmlFor="shop-latitude">Latitude *</label>
              <input
                type="text"
                id="shop-latitude"
                className="form-control"
                placeholder="e.g. 37.7749"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                onBlur={updateMarkerFromInputs}
                disabled={loading}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
              <label htmlFor="shop-longitude">Longitude *</label>
              <input
                type="text"
                id="shop-longitude"
                className="form-control"
                placeholder="e.g. -122.4194"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                onBlur={updateMarkerFromInputs}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="shop-desc">Shop Description *</label>
            <textarea
              id="shop-desc"
              rows="4"
              className="form-control"
              placeholder="Describe their chai quality, signature blends, spacing, and visual aesthetic..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="shop-photo">Photo URL (Optional)</label>
            <input
              type="url"
              id="shop-photo"
              className="form-control"
              placeholder="e.g. https://images.unsplash.com/..."
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              disabled={loading}
            />
            <small className="form-help-text">
              Leave blank to auto-assign a high-quality default chai placeholder image.
            </small>
          </div>

          <div className="add-shop-actions">
            <button 
              type="submit" 
              className="btn btn-primary add-shop-submit-btn"
              disabled={loading}
            >
              {loading ? 'Submitting Spot...' : 'Submit Chai Shop'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddShopPage;
