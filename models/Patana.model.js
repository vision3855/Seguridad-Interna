const mongoose = require('mongoose');

const PatanaSchema = new mongoose.Schema({
  patanaType: {
    type: String,
    enum: ['ISM', 'TERCERO'],
    default: 'TERCERO'
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
    type: Number,
    default: null
  } 
});
module.exports = mongoose.model('Patana', PatanaSchema);
// ready to go!