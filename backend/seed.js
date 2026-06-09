const mongoose = require("mongoose");
const Wagon = require("./models/Wagon");

mongoose
  .connect("mongodb://127.0.0.1:27017/railwayDB")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const wagonTypes = [
  "Cargo",
  "Passenger",
  "Oil Tanker",
  "Container",
  "Flatbed",
];

const statuses = [
  "Active",
  "Available",
  "Maintenance",
  "Inactive",
];

const locations = [
  "Mumbai",
  "Delhi",
  "Kolkata",
  "Chennai",
  "Pune",
  "Nagpur",
  "Hyderabad",
];

const routes = [
  "Mumbai-Delhi",
  "Delhi-Kolkata",
  "Chennai-Pune",
  "Nagpur-Hyderabad",
  "Mumbai-Chennai",
];

const issues = [
  "Brake Failure",
  "Wheel Damage",
  "Engine Issue",
  "Coupling Problem",
  "Oil Leakage",
];

const engineers = [
  "Rahul Sharma",
  "Amit Verma",
  "Sneha Patil",
  "Vikram Singh",
  "Priya Joshi",
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start, end) {
  return new Date(
    start.getTime() +
      Math.random() * (end.getTime() - start.getTime())
  );
}

async function seedData() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/railwayDB");

    console.log("MongoDB Connected");

    await Wagon.deleteMany();

    const wagons = [];

    for (let i = 1; i <= 50; i++) {
      const status = randomItem(statuses);
      const maintenanceHistory = [];
      const repairCount = Math.floor(Math.random() * 4);

      for (let j = 0; j < repairCount; j++) {
        maintenanceHistory.push({
          date: randomDate(new Date(2025, 0, 1), new Date()),
          issue: randomItem(issues),
          engineer: randomItem(engineers),
          cost: Math.floor(Math.random() * 50000) + 5000,
          remarks: "Routine maintenance completed",
        });
      }

      let maintenanceStartDate = null;
      let maintenanceEndDate = null;

      if (status === "Maintenance") {
        maintenanceStartDate = randomDate(new Date(2026, 0, 1), new Date());
      }

      if (status === "Available") {
        maintenanceStartDate = randomDate(
          new Date(2025, 0, 1),
          new Date(2025, 11, 1)
        );

        maintenanceEndDate = randomDate(new Date(2025, 11, 2), new Date());
      }

      wagons.push({
        wagonNumber: `W${String(i).padStart(3, "0")}`,
        type: randomItem(wagonTypes),
        capacity: Math.floor(Math.random() * 9000) + 1000,
        status,
        currentLocation: randomItem(locations),
        assignedRoute: randomItem(routes),
        lastMaintenanceDate: randomDate(new Date(2025, 0, 1), new Date()),
        nextMaintenanceDate: randomDate(new Date(), new Date(2026, 11, 31)),
        maintenanceStartDate,
        maintenanceEndDate,
        maintenanceHistory,
      });
    }

    await Wagon.insertMany(wagons);

    console.log("50 Wagons Inserted Successfully");

    process.exit();
  } catch (err) {
    console.error("SEED ERROR:", err);
    process.exit(1);
  }
}

seedData();