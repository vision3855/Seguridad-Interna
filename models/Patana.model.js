const mongoose = require('mongoose');

const PatanaSchema = new mongoose.Schema({
  patanaType: {
    type: String,
    required: [true, "Please tell us whether it's ISM or TERCERO"]
  },
  driver: {
    type: String,
    required: [true, 'Por favor entra el nombre del chofer']
  },
  placa: {
    type: Number,
    required: [true, 'Por favor entra el numero de placa de la patana']
  },
  ficha: {
    type: String,
    default: null
  },
  placaUnidad: {
    type: String,
    default: null
  },
  createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
});
module.exports = mongoose.model('Patana', PatanaSchema);
// ready to go!