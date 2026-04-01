const visitReport = require("../models/visitReport.js");

// CREATE - Add new document
const createVisits = async (req, res) => {
  const date = new Date();
  const todayFormatted = date.toLocaleDateString("en-GB");

  try {
    const visit = new visitReport({dia: todayFormatted, createdBy: req.user.id, ...req.body});
    const savedVisit = await visit.save();
    res.status(201).json({
      success: true,
      data: savedVisit,
      message: "Visit created successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// READ - Get all documents
const getAllVisits = async (req, res) => {

  try {
    const { name, dia } = req.query;
    const queryObj = {};
    if (name) {
      queryObj.name = { $regex: name, $options: "i" };
    }
    if (dia) {
      queryObj.dia = dia;
    }
    let result = visitReport.find(queryObj);
    const visits = await result;
    res.status(200).json({
      success: true,
      count: visits.length,
      data: visits,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// READ - Get single document by ID
const getVisitsById = async (req, res) => {
  try {
    const item = await ModelName.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }
    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE - Update document by ID
const updateVisits = async (req, res) => {
  try {
    const updatedVisit = await visitReport.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Return updated document
        runValidators: true, // Run schema validators
      },
    );

    if (!updatedVisit) {
      return res.status(404).json({
        success: false,
        message: "Visit not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedVisit,
      message: "Visit updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE - Delete document by ID
const deleteVisits = async (req, res) => {
  try {
    const deletedItem = await ModelName.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createVisits,
  getAllVisits,
  getVisitsById,
  updateVisits,
  deleteVisits,
};
