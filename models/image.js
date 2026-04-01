const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  hourIn: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  idNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  business: {
    type: String,
    required: true,
  },
  zoneVisited: {
    type: String,
    default: "distribucion y caja",
  },
  visitMotif: {
    type: String,
    default: "pagar pedido",
  },
  authorizedBy: {
    type: String,
    default: "Ventas",
  },
  hourOut: {
    type: String,
    required: true,
  },
  image: {
    data: Buffer,
    contentType: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Image", imageSchema);
