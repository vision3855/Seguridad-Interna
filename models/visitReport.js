const mongoose = require("mongoose");

const visitReport = new mongoose.Schema({
  hourIn: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  dia: {
    type: String,
    required: true
  },
  idNumber: {
    type: Number,
    required: true,
  },
  business: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    default:'Dentro del centro'
  },
  zoneVisited: {
    type: String,
    default: 'distribucion y caja'
  },
  visitMotif: {
    type: String,
    default: 'pagar pedido'
  },
  authorizedBy: {
    type: String,
    default: 'Ventas'
  },
  hourOut: {
    type: String,
    required: true
  },
  refImg: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image'
  },

});


module.exports = mongoose.model('VisitReport', visitReport);
