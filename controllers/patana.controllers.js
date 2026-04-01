const { StatusCodes } = require("http-status-codes");
const Patana = require("../models/Patana.model");

async function newPatana(req, res) {
  try {
    const patana = await Patana.create({createdBy: req.user.id, ...req.body});
    res.status(StatusCodes.CREATED).json({ patana });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "error detected" });
  }
}

async function getAllPatana(req, res) {
  try {
    const {driver} = req.query;
    const queryObj = {};
    if (driver) {
        queryObj.driver = { $regex: driver, $options: 'i' };
    }
    let result = Patana.find(queryObj);
    const patanas = await result;
    res.status(StatusCodes.OK).json({ patanas, count: patanas.length });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "error detected" });
  }
}

module.exports = { newPatana, getAllPatana };
