const mongoose = require('mongoose');

const blacklistTokenSchema = new mongoose.Schema({  
  token: {
    type: String,
    required: true, 
    unique: true,
  },
  CreatedAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // 1 day in seconds
  },
});

module.exports = mongoose.models.blacklistToken 
  || mongoose.model('blacklistToken', blacklistTokenSchema);
