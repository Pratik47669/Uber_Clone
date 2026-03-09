const mapService = require('../services/maps.service')
const {validationResult} = require('express-validator')

module.exports.getAddressCoordinate = async (req,res,next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
     return res.status(400).json({errors:errors.array()})
  }
   const { address } = req.query;
    try {
           const coordinates = await mapService.getAddressCoordinate
           (address);
           res.status(200).json(coordinates);
        }
        
     catch (error) {
       res.status(404).json({message: "Coordinates not found"});

    }
}

module.exports.getDistanceTime = async (req, res) => {
  try {
    const { origin, destination } = req.query;

    const result = await mapService.getDistanceTime(origin, destination);
    return res.status(200).json(result);

  } catch (error) {
    console.log("DISTANCE ERROR =>", error.message);
    console.log("FULL ERROR =>", error);
    return res.status(500).json({ error: error.message });
  }
};


module.exports.getAutoCompleteSuggestions = async (req, res) => {
  try {
    const { input } = req.query;

    if (!input || input.trim().length < 2) {
     
      return res.status(200).json([]);
    }

   
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const suggestions = await mapService.getAutoCompleteSuggestions(input);

    res.status(200).json(suggestions);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
