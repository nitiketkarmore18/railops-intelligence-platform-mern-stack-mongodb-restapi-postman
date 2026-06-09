const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

module.exports.io = io;

const wagonRoutes = require("./routes/wagonRoutes.js");
const uploadRoutes = require("./routes/uploadRoutes.js");

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/wagons", wagonRoutes);
app.use("/api/upload", uploadRoutes);

// MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/railwayDB")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Socket Connection
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Test route
app.get("/", (req, res) => {
  res.send("API Running");
});

// Start server
server.listen(5000, () => {
  console.log("Server running on port 5000");
});