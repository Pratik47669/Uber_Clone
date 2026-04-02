const rideService = require('../services/ride.service');
const { validationResult } = require('express-validator');
const mapService = require('../services/maps.service');
const { sendMessageToSocketId } = require('../socket');
const rideModel = require('../models/ride.model');
const userModel = require('../models/user.model');
const captainModel = require('../models/captain.model'); 

module.exports.createRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    const { userId, pickup, destination, vehicleType } = req.body;

    try {
const ride = await rideService.createRide({ user: req.user._id, pickup, destination, vehicleType });

const rideWithUser = await rideModel.findById(ride._id)
    .populate('user') 
    .lean();

console.log("DEBUG -> User ID:", rideWithUser.user._id);
console.log("DEBUG -> Socket ID in DB:", rideWithUser.user.socketId);

if (!rideWithUser.user.socketId) {
    console.log("⚠️ WARNING: SocketId missing, trying to proceed anyway...");
}else {
    console.log("✅ USER SOCKET FOUND:", rideWithUser.user.socketId);
}

        if (!rideWithUser) {
            return res.status(500).json({ message: "Ride creation failed" });
        }
       

        // Hide OTP
        rideWithUser.otp = "";

        // ✅ Send response after populate
        res.status(201).json(rideWithUser);
     // Get nearby captains
const pickupCoordinates = await mapService.getAddressCoordinate(pickup);
const captainsInRadius = await mapService.getCaptainsInTheRadius(
  pickupCoordinates.lat,
  pickupCoordinates.lng,
  100000 // 100 km radius
);

console.log("Nearby Captains:", captainsInRadius);

// Send ride to captains
captainsInRadius.forEach(captain => {
  if (captain && captain.socketId) {
    console.log("Sending ride to captain:", captain.socketId);
    sendMessageToSocketId(captain.socketId, {
      event: "new-ride",
      data: rideWithUser
    });
  }
});

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports.getFare = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination } = req.query;

    try {
        const fare = await rideService.getFare(pickup, destination);
        return res.status(200).json(fare);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports.confirmRide = async (req, res) => {
    try {
        const { rideId } = req.body;

        if (!rideId) {
            return res.status(400).json({ message: "rideId required" });
        }

        // 1. Update status
        await rideModel.findByIdAndUpdate(rideId, {
            status: 'accepted',
            captain: req.captain._id
        });

        // 2. Populate karte waqt model ka naam wahi likho jo registration ke waqt tha
        const ride = await rideModel.findById(rideId)
            .populate({ 
                path: 'user', 
                model: 'user' // check kar user model ka naam kya hai
            })
            .populate({ 
                path: 'captain', 
                model: 'captain' // 👈 AGAR TUNE SMALL 'c' SE REGISTER KIYA HAI TOH YAHAN SMALL HI RAKHNA
            })
            .select('+otp')
            .lean();

        if (!ride) {
            return res.status(404).json({ message: "Ride not found" });
        }

        // 3. Socket bhejte waqt Room ID (User ID) use karo
        sendMessageToSocketId(ride.user._id.toString(), {
            event: "ride-confirmed",
            data: ride
        });

        return res.status(200).json(ride);

    } catch (err) {
        console.log("❌ SERVER ERROR:", err.message);
        return res.status(500).json({ message: err.message });
    }
};

module.exports.startRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId, otp } = req.query;

    try {
        const ride = await rideService.startRide({ rideId, otp, captain: req.captain });

        console.log(ride);

    sendMessageToSocketId(ride.user._id.toString(), {
    event: 'ride-started',
    data: ride
});  

        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}


module.exports.endRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        const ride = await rideService.endRide({ rideId, captain: req.captain });

        sendMessageToSocketId(ride.user._id.toString(), {
            event: 'ride-ended',
            data: ride
        })

        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    } 
}

