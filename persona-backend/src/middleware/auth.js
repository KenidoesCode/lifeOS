const mongoose = require("mongoose");

module.exports = function (req, res, next) {
  req.user = {
    id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"),
  };
  next();
};
