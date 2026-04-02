import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// 🔵 Blue Dot Icon
const blueDotIcon = L.divIcon({
    className: 'custom-div-icon',
    html: "<div style='background-color:#4285F4; width:16px; height:16px; border-radius:50%; border:2px solid white; box-shadow: 0 0 8px rgba(66,133,244,0.6);'></div>",
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

// ... baaki imports same rahenge

function RecenterMap({ coords }) {
    const map = useMap();
    useEffect(() => {
        if (coords) {
            // 🚀 FAST UPDATE: Duration ko 1.5 se 0.5 kar diya taaki map turant move ho
            map.flyTo([coords.lat, coords.lng], map.getZoom(), {
                animate: true,
                duration: 0.5 
            });
        }
    }, [coords]);
    return null;
}

// ... baaki saara code (imports, RecenterMap) same rahega

const LiveTracking = () => {
    const [currentPosition, setCurrentPosition] = useState({ lat: 22.7196, lng: 75.8577 });

    useEffect(() => {
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setCurrentPosition({ lat: latitude, lng: longitude });
            },
            (err) => {
                // Agar sirf timeout hai toh hum dobara koshish karenge, console block nahi karenge
                if (err.code === 3) {
                    console.warn("🛰️ Signal thoda weak hai, still trying...");
                } else {
                    console.error("❌ Geolocation Error:", err.message);
                }
            },
            { 
                enableHighAccuracy: true, 
                timeout: 15000,      // ⏱️ 5 sec se badha kar 15 sec kar diya (Wait time badha diya)
                maximumAge: 10000    // 🔄 10 second purana data use karne ki ijaat de di
            }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);


    return (
        <div style={{ height: '100%', width: '100%' }}>
            <MapContainer 
                center={[currentPosition.lat, currentPosition.lng]} 
                zoom={18} 
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                />
                
                <ZoomControl position="topright" /> 

                <Marker position={[currentPosition.lat, currentPosition.lng]} icon={blueDotIcon} />
                <RecenterMap coords={currentPosition} />
            </MapContainer>
        </div>
    )
}

export default LiveTracking;