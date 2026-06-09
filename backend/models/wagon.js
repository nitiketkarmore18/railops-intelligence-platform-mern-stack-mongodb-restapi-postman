const mongoose = require("mongoose");

const wagonSchema = new mongoose.Schema(
  {
    wagonNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
      enum: ["Cargo", "Passenger", "Oil Tanker", "Container", "Flatbed"],
    },

    capacity: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      required: true,
      enum: ["Active", "Available", "Maintenance", "Inactive"],
      default: "Available",
    },

    currentLocation: {
      type: String,
      required: true,
    },

    assignedRoute: {
      type: String,
      required: true,
    },

    lastMaintenanceDate: {
      type: Date,
    },

    nextMaintenanceDate: {
      type: Date,
    },

    maintenanceStartDate: {
      type: Date,
    },

    maintenanceEndDate: {
      type: Date,
    },

    // Maintenance History
    maintenanceHistory: [
      {
        date: {
          type: Date,
          default: Date.now,
        },

        issue: {
          type: String,
          required: true,
        },

        engineer: {
          type: String,
          required: true,
        },

        cost: {
          type: Number,
          default: 0,
        },

        remarks: {
          type: String,
        },
      },
    ],
  },

  { timestamps: true }
);

module.exports = mongoose.model("Wagon", wagonSchema);