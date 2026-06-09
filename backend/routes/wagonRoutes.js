const express = require("express");
const router = express.Router();
const Wagon = require("../models/Wagon");

const { io } = require("../server");

// GET all wagons
router.get("/", async (req, res) => {
  try {
    const wagons = await Wagon.find().sort({ createdAt: -1 });
    res.json(wagons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD wagon
router.post("/", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const newWagon = new Wagon({
      wagonNumber: req.body.wagonNumber,
      type: req.body.type,
      capacity: Number(req.body.capacity),
      status: req.body.status,
      currentLocation: req.body.currentLocation,
      assignedRoute: req.body.assignedRoute,
      lastMaintenanceDate: req.body.lastMaintenanceDate || null,
      nextMaintenanceDate: req.body.nextMaintenanceDate || null,

      maintenanceStartDate:
        req.body.status === "Maintenance" ? new Date() : null,

      maintenanceEndDate: null,
    });

    const savedWagon = await newWagon.save();

    io.emit("wagonDataUpdated");

    res.status(201).json(savedWagon);
  } catch (err) {
    console.error("ADD WAGON ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// UPDATE wagon
router.put("/:id", async (req, res) => {
  try {
    const existingWagon = await Wagon.findById(req.params.id);

    if (!existingWagon) {
      return res.status(404).json({ message: "Wagon not found" });
    }

    const previousStatus = existingWagon.status;
    const newStatus = req.body.status;

    existingWagon.wagonNumber = req.body.wagonNumber;
    existingWagon.type = req.body.type;
    existingWagon.capacity = Number(req.body.capacity);
    existingWagon.status = newStatus;
    existingWagon.currentLocation = req.body.currentLocation;
    existingWagon.assignedRoute = req.body.assignedRoute;
    existingWagon.lastMaintenanceDate =
      req.body.lastMaintenanceDate || null;
    existingWagon.nextMaintenanceDate =
      req.body.nextMaintenanceDate || null;

    if (
      previousStatus !== "Maintenance" &&
      newStatus === "Maintenance"
    ) {
      existingWagon.maintenanceStartDate = new Date();
      existingWagon.maintenanceEndDate = null;
    }

    if (
      previousStatus === "Maintenance" &&
      newStatus !== "Maintenance"
    ) {
      existingWagon.maintenanceEndDate = new Date();
    }

    const updatedWagon = await existingWagon.save();

    io.emit("wagonDataUpdated");

    res.json(updatedWagon);
  } catch (err) {
    console.error("UPDATE WAGON ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// DELETE wagon
router.delete("/:id", async (req, res) => {
  try {
    await Wagon.findByIdAndDelete(req.params.id);

    io.emit("wagonDataUpdated");

    res.json({ message: "Wagon deleted" });
  } catch (err) {
    console.error("DELETE WAGON ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ADD maintenance history record
router.post("/:id/maintenance-history", async (req, res) => {
  try {
    const { issue, engineer, cost, remarks } = req.body;

    const wagon = await Wagon.findById(req.params.id);

    if (!wagon) {
      return res.status(404).json({ message: "Wagon not found" });
    }

    if (wagon.status !== "Maintenance") {
      wagon.status = "Maintenance";
    }

    if (!wagon.maintenanceStartDate) {
      wagon.maintenanceStartDate = new Date();
    }

    wagon.maintenanceEndDate = null;

    wagon.maintenanceHistory.push({
      issue,
      engineer,
      cost: Number(cost),
      remarks,
      date: new Date(),
    });

    const updatedWagon = await wagon.save();

    io.emit("wagonDataUpdated");

    res.status(201).json(updatedWagon);
  } catch (err) {
    console.error("MAINTENANCE HISTORY ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// MARK wagon as fixed
router.put("/:id/mark-fixed", async (req, res) => {
  try {
    const wagon = await Wagon.findById(req.params.id);

    if (!wagon) {
      return res.status(404).json({ message: "Wagon not found" });
    }

    wagon.status = "Available";
    wagon.lastMaintenanceDate = new Date();
    wagon.maintenanceEndDate = new Date();

    const updatedWagon = await wagon.save();

    io.emit("wagonDataUpdated");

    res.json(updatedWagon);
  } catch (err) {
    console.error("MARK FIXED ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
