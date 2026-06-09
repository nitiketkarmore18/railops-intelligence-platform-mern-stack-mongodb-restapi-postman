const express = require("express");
const router = express.Router();

const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");

const Wagon = require("../models/Wagon");

// Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// CSV Upload Route
router.post(
  "/csv",
  upload.single("file"),
  async (req, res) => {
    try {
      const results = [];

      fs.createReadStream(req.file.path)
        .pipe(csv())

        .on("data", (data) => {
          results.push({
            wagonNumber: data.wagonNumber,
            type: data.type,
            capacity: Number(data.capacity),
            status: data.status,
            currentLocation: data.currentLocation,
            assignedRoute: data.assignedRoute,

            lastMaintenanceDate:
              data.lastMaintenanceDate || null,

            nextMaintenanceDate:
              data.nextMaintenanceDate || null,
          });
        })

        .on("end", async () => {
          await Wagon.insertMany(results);

          fs.unlinkSync(req.file.path);

          res.json({
            message:
              "CSV Uploaded Successfully",
            inserted: results.length,
          });
        });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        message: "CSV Upload Failed",
      });
    }
  }
);

module.exports = router;