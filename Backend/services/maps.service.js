const axios = require("axios");
const captainModel = require('../models/captain.model');

// 🔹 helper function (coordinates nikalne ke liye)
async function getCoordinates(place) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`;

  const response = await axios.get(url, {
    headers: {
      "User-Agent": "uber-clone-app"
    }
  });

  if (!response.data || response.data.length === 0) {
    throw new Error("Location not found");
  }

  return {
    lat: response.data[0].lat,
    lon: response.data[0].lon
  };
}

// 🔹 existing function (address → coordinates)
module.exports.getAddressCoordinate = async (address) => {
  const coord = await getCoordinates(address);

  return {
  lat: Number(coord.lat),
  lng: Number(coord.lon)
};
};

// 🔹 distance + time
module.exports.getDistanceTime = async (origin, destination) => {
  const o = await getCoordinates(origin);
  const d = await getCoordinates(destination);

  const routeUrl = `https://router.project-osrm.org/route/v1/driving/${o.lon},${o.lat};${d.lon},${d.lat}?overview=false`;

  const response = await axios.get(routeUrl);

  if (!response.data.routes || response.data.routes.length === 0) {
    throw new Error("No route found");
  }

  const route = response.data.routes[0];

  return {
    distance: (route.distance / 1000).toFixed(2) + " km",
    duration: Math.round(route.duration / 60) + " mins"
  };
};

// 🔹 FREE autocomplete using OpenStreetMap (Nominatim)
module.exports.getAutoCompleteSuggestions = async (input) => {
    if (!input) throw new Error("input is required");

    // Nominatim URL with more headers to look like a browser
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&addressdetails=1&limit=5&countrycodes=in`;

    try {
        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });

        if (!response.data) return [];
        return response.data.map(place => place.display_name);

    } catch (error) {
        console.error("MAP API ERROR:", error.message);
        return []; // 500 error ki jagah khali list bhej do taaki app na ruke
    }
};

module.exports.getCaptainsInTheRadius = async (lat, lng, radius) => {

    const captains = await captainModel.find({
        location: {
            $geoWithin: {
                $centerSphere: [ [ lng, lat ], radius / 6371 ]
            }
        }
    });

    return captains;
}
// module.exports.getCaptainsInTheRadius = async (lat, lng, radius) => {

//     // radius in km

//     const captains = await captainModel.find({
//         location: {
//             $geoWithin: {
//                 $centerSphere: [ [ lng, lat ], radius / 6371 ]
//             }
//         }

//     });

//     return captains;


// }