const mongoose = require("mongoose");

const ingresoPatanaSchema = new mongoose.Schema({
  patanaType: {
    type: String,
    required: [true, "Please tell us whether it's ISM or TERCERO"],
  },
  dia: {
    type: String,
    required: [true, "No es posible registrar una patana sin día."],
  },
  driver: {
    type: String,
    required: [true, "Por favor entra el nombre del chofer"],
  },
  placa: {
    type: Number,
    required: [true, "Por favor entra el numero de placa de la patana"],
  },
  ficha: {
    type: String,
    default: null,
  },
  placaUnidad: {
    type: String,
    default: null,
  },
  productos: {
    type: String,
    required: [true, "No es posible de recibir una patana sin productos."],
  },
  separadores: {
    type: Number,
    default: 147,
  },
  paletas: {
    type: Number,
    default: 21,
  },
});

ingresoPatanaSchema.statics.findByDate = function (date){
  return this.find({dia: date})
}


module.exports = mongoose.model("Ingreso", ingresoPatanaSchema);
// ready to go!
