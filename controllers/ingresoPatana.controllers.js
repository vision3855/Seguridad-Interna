const { StatusCodes } = require("http-status-codes");
const Ingreso = require("../models/ingresoPatana.model");

async function createIngreso(req, res) {
  try {
    const date = new Date();

    const todayFormatted = date.toLocaleDateString("en-GB");

    const data = {dia:todayFormatted, ...req.body};
    const ingreso = await Ingreso.create(data);
    res.status(StatusCodes.CREATED).json({ ingreso });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "error detected" });
  }
}

async function getAllIngreso(req, res) {
  try {
    const { driver } = req.query;
    const queryObj = {};
    if (driver) {
      queryObj.driver = { $regex: driver, $options: "i" };
    }
    let result = Ingreso.find(queryObj);
    const ingresos = await result;
    res.status(StatusCodes.OK).json({ ingresos, count: ingresos.length });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "error detected" });
  }
}

module.exports = { createIngreso, getAllIngreso };
