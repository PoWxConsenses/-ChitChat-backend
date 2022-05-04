const dotenv = require("dotenv");
const http = require("http");
const mongoose = require("mongoose");
const socketExec = require("./socket/socket");
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: "./config.env" });
const app = require("./app.js");

const DATABASE = process.env.DATABASE.replace(
  "<password>",
  process.env.PASSWORD
);
mongoose.connect(DATABASE).then(() => {
  console.log("Database Successfully Connected");
});

const PORT = process.env.PORT;

const socketServer = http.createServer(app);
const server = socketServer.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`);
});

io = require("socket.io")(socketServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});
io.on("connection", socketExec);

process.on("unhandledRejection", (err) => {
  console.log("UNHANDELED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
