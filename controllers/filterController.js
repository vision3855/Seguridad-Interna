const Patana = require("../models/ingresoPatana.model");
const mongoose = require("mongoose");

/**
 * GET /api/patanas
 *
 * Query params (all optional, combinable):
 *   patanaType   - exact match          e.g. ?patanaType=TERCERO
 *   dia          - exact match          e.g. ?dia=04/05/2026
 *   driver       - partial/case-insensitive e.g. ?driver=walkins
 *   placa        - exact match (number) e.g. ?placa=18858
 *   ficha        - "null" → null, else exact match
 *   placaUnidad  - "null" → null, else exact match
 *   productos    - partial/case-insensitive e.g. ?productos=kola
 *   separadores  - exact match (number) e.g. ?separadores=147
 *   paletas      - exact match (number) e.g. ?paletas=21
 *   createdBy    - ObjectId             e.g. ?createdBy=69ce62d0a5e2cf865f809d28
 *   startDate    - range start for dia  e.g. ?startDate=01/05/2026
 *   endDate      - range end for dia    e.g. ?endDate=31/05/2026
 *   minSeparadores / maxSeparadores     e.g. ?minSeparadores=100&maxSeparadores=200
 *   minPaletas   / maxPaletas           e.g. ?minPaletas=10&maxPaletas=30
 *   page         - pagination (default 1)
 *   limit        - results per page (default 20, max 100)
 *   sortBy       - field to sort by (default "dia")
 *   sortOrder    - "asc" or "desc" (default "desc")
 */
const getPatanas = async (req, res) => {
  try {
    const {
      patanaType,
      dia,
      driver,
      placa,
      ficha,
      placaUnidad,
      productos,
      separadores,
      paletas,
      createdBy,
      startDate,
      endDate,
      minSeparadores,
      maxSeparadores,
      minPaletas,
      maxPaletas,
      page = 1,
      limit = 20,
      sortBy = "dia",
      sortOrder = "desc",
    } = req.query;

    const filter = {};

    // ── Exact string matches ─────────────────────────────────────────────────
    if (patanaType) filter.patanaType = patanaType.toUpperCase();
    if (dia) filter.dia = dia;

    // ── Partial / case-insensitive string matches ────────────────────────────
    if (driver) filter.driver = { $regex: driver, $options: "i" };
    if (productos) filter.productos = { $regex: productos, $options: "i" };

    // ── Numeric exact matches ────────────────────────────────────────────────
    if (placa !== undefined) {
      const n = Number(placa);
      if (isNaN(n))
        return res.status(400).json({ message: "placa must be a number" });
      filter.placa = n;
    }

    // ── Numeric range filters ────────────────────────────────────────────────
    if (separadores !== undefined) {
      filter.separadores = Number(separadores);
    } else if (minSeparadores !== undefined || maxSeparadores !== undefined) {
      filter.separadores = {};
      if (minSeparadores !== undefined)
        filter.separadores.$gte = Number(minSeparadores);
      if (maxSeparadores !== undefined)
        filter.separadores.$lte = Number(maxSeparadores);
    }

    if (paletas !== undefined) {
      filter.paletas = Number(paletas);
    } else if (minPaletas !== undefined || maxPaletas !== undefined) {
      filter.paletas = {};
      if (minPaletas !== undefined) filter.paletas.$gte = Number(minPaletas);
      if (maxPaletas !== undefined) filter.paletas.$lte = Number(maxPaletas);
    }

    // ── Nullable fields ──────────────────────────────────────────────────────
    if (ficha !== undefined) {
      filter.ficha = ficha === "null" ? null : ficha;
    }
    if (placaUnidad !== undefined) {
      filter.placaUnidad = placaUnidad === "null" ? null : placaUnidad;
    }

    // ── ObjectId filter ──────────────────────────────────────────────────────
    if (createdBy) {
      if (!mongoose.Types.ObjectId.isValid(createdBy)) {
        return res.status(400).json({ message: "Invalid createdBy ObjectId" });
      }
      filter.createdBy = new mongoose.Types.ObjectId(createdBy);
    }

    // ── Date range on "dia" field (format DD/MM/YYYY) ────────────────────────
    // Converts to comparable strings; works when format is consistent.
    if (startDate || endDate) {
      // If a direct dia filter is already set, date range takes precedence.
      delete filter.dia;
      filter.$expr = buildDateRangeExpr(startDate, endDate);
    }

    // ── Pagination & sorting ─────────────────────────────────────────────────
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    // ── Query ────────────────────────────────────────────────────────────────
    const [data, total] = await Promise.all([
      Patana.find(filter)
        .populate("createdBy", "name email")
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Patana.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      limit: limitNum,
      data,
    });
  } catch (error) {
    console.error("[getPatanas]", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * GET /api/patanas/:id  — fetch a single patana by _id
 */
const getPatanaById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const patana = await Patana.findById(id)
      .populate("createdBy", "name email")
      .lean();
    if (!patana) return res.status(404).json({ message: "Patana not found" });

    return res.status(200).json({ success: true, data: patana });
  } catch (error) {
    console.error("[getPatanaById]", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * GET /api/patanas/stats  — aggregated summary grouped by patanaType & driver
 */
const getPatanaStats = async (req, res) => {
  try {
    const stats = await Patana.aggregate([
      {
        $group: {
          _id: { patanaType: "$patanaType", driver: "$driver" },
          totalSeparadores: { $sum: "$separadores" },
          totalPaletas: { $sum: "$paletas" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.patanaType": 1, "_id.driver": 1 } },
    ]);

    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("[getPatanaStats]", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Builds a $expr that compares DD/MM/YYYY strings as dates.
 * Converts "04/05/2026" → ISODate for proper comparison.
 */
function buildDateRangeExpr(startDate, endDate) {
  const toDate = (ddmmyyyy) => {
    const [dd, mm, yyyy] = ddmmyyyy.split("/");
    return new Date(`${yyyy}-${mm}-${dd}T00:00:00.000Z`);
  };

  const conditions = [];
  if (startDate)
    conditions.push({
      $gte: [
        { $dateFromString: { dateString: "$dia", format: "%d/%m/%Y" } },
        toDate(startDate),
      ],
    });
  if (endDate)
    conditions.push({
      $lte: [
        { $dateFromString: { dateString: "$dia", format: "%d/%m/%Y" } },
        toDate(endDate),
      ],
    });

  return conditions.length === 1 ? conditions[0] : { $and: conditions };
}

module.exports = { getPatanas, getPatanaById, getPatanaStats };
