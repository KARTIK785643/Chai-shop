import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './MapView.css';

const MapView = ({ shops }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [mapError, setMapError] = useState(false);
  const [activeShopId, setActiveShopId] = useState(null);

  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    
    if (!token || token.trim() === "") {
      setMapError(true);
      return;
    }

    try {
      mapboxgl.accessToken = token;
      
      
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-122.4194, 37.7749], 
        zoom: 12,
      });

      mapRef.current = map;

      
      map.addControl(new mapboxgl.NavigationControl(), 'top-right');

      
      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
        showAccuracyCircle: true,
      });
      map.addControl(geolocate, 'top-right');

      return () => {
        map.remove();
      };
    } catch (err) {
      console.error("Mapbox failed to load:", err);
      setMapError(true);
    }
  }, [token]);

  
  useEffect(() => {
    if (!mapRef.current) return;

    
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    
    shops.forEach((shop) => {
      if (!shop.latitude || !shop.longitude) return;

      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${shop.latitude},${shop.longitude}`;
      
      
      const popupHTML = `
        <div class="map-popup">
          <div class="map-popup-title">${shop.name}</div>
          <div class="map-popup-rating">
            <span style="color: #FFB300;">★</span> 
            <strong>${shop.averageRating || '0.0'}</strong> 
            <span style="color: #8D6E63; font-size: 0.8rem;">(${shop.reviewCount || 0})</span>
          </div>
          <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" class="map-popup-btn">
            Get Directions
          </a>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25, closeOnClick: true })
        .setHTML(popupHTML);

      
      const markerEl = document.createElement('div');
      markerEl.className = 'custom-map-marker';
      
      const innerMarker = document.createElement('div');
      innerMarker.className = 'custom-map-marker-inner';
      innerMarker.innerHTML = '☕';
      markerEl.appendChild(innerMarker);

      const marker = new mapboxgl.Marker({ element: markerEl })
        .setLngLat([shop.longitude, shop.latitude])
        .setPopup(popup)
        .addTo(mapRef.current);

      markersRef.current.push(marker);
    });

    
    if (shops.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      let hasValidCoords = false;

      shops.forEach((shop) => {
        if (shop.latitude && shop.longitude) {
          bounds.extend([shop.longitude, shop.latitude]);
          hasValidCoords = true;
        }
      });

      if (hasValidCoords) {
        mapRef.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 14,
          duration: 1000
        });
      }
    }
  }, [shops]);

  
  const getMockPosition = (lat, lng) => {
    const lats = shops.map((s) => s.latitude).filter((l) => l !== undefined);
    const lngs = shops.map((s) => s.longitude).filter((l) => l !== undefined);

    const minLat = lats.length > 0 ? Math.min(...lats) : 37.74;
    const maxLat = lats.length > 0 ? Math.max(...lats) : 37.81;
    const minLng = lngs.length > 0 ? Math.min(...lngs) : -122.46;
    const maxLng = lngs.length > 0 ? Math.max(...lngs) : -122.38;

    const latRange = maxLat - minLat || 0.01;
    const lngRange = maxLng - minLng || 0.01;

    
    const x = 10 + ((lng - minLng) / lngRange) * 80;
    const y = 90 - ((lat - minLat) / latRange) * 80;

    return {
      left: `${x}%`,
      top: `${y}%`
    };
  };

  const activeShop = shops.find((s) => s.id === activeShopId);

  if (mapError) {
    return (
      <div className="map-view-wrapper mock-map-wrapper" onClick={() => setActiveShopId(null)}>
        <div className="mock-map-grid">
          {}
          <div className="mock-map-road horizontal" style={{ top: '30%' }}></div>
          <div className="mock-map-road horizontal" style={{ top: '70%' }}></div>
          <div className="mock-map-road vertical" style={{ left: '25%' }}></div>
          <div className="mock-map-road vertical" style={{ left: '75%' }}></div>
          <div className="mock-map-park" style={{ top: '10%', left: '10%', width: '15%', height: '18%' }}></div>
          <div className="mock-map-park" style={{ top: '48%', left: '42%', width: '22%', height: '24%' }}></div>

          {}
          {shops.map((shop) => {
            if (!shop.latitude || !shop.longitude) return null;
            const pos = getMockPosition(shop.latitude, shop.longitude);
            return (
              <button
                key={shop.id}
                type="button"
                className={`custom-map-marker ${activeShopId === shop.id ? 'active' : ''}`}
                style={{ position: 'absolute', left: pos.left, top: pos.top, transform: 'translate(-50%, -50%)', border: 'none', background: 'transparent' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveShopId(activeShopId === shop.id ? null : shop.id);
                }}
                aria-label={`View ${shop.name} details on fallback map`}
              >
                <div className="custom-map-marker-inner"></div>
              </button>
            );
          })}

          {}
          {activeShop && (
            <div
              className="mapboxgl-popup mock-map-popup"
              style={{
                position: 'absolute',
                left: getMockPosition(activeShop.latitude, activeShop.longitude).left,
                top: getMockPosition(activeShop.latitude, activeShop.longitude).top,
                transform: 'translate(-50%, -108%)',
                zIndex: 100
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mapboxgl-popup-content">
                <button
                  type="button"
                  className="mapboxgl-popup-close-button"
                  onClick={() => setActiveShopId(null)}
                  aria-label="Close popup"
                >
                  ×
                </button>
                <div className="map-popup-title">{activeShop.name}</div>
                <div className="map-popup-rating">
                  <span style={{ color: '#FFB300' }}>★</span>
                  <strong>{activeShop.averageRating || '0.0'}</strong>
                  <span style={{ color: '#8D6E63', fontSize: '0.8rem' }}>({activeShop.reviewCount || 0})</span>
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${activeShop.latitude},${activeShop.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="map-popup-btn"
                >
                  Get Directions
                </a>
              </div>
            </div>
          )}

          {}
          <div className="mock-map-info-banner">
            <span className="banner-icon">💡</span>
            <div className="banner-text-block">
              <strong>Demo Map Active</strong>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="map-view-wrapper">
      <div ref={mapContainerRef} className="map-container" />
    </div>
  );
};

export default MapView;
