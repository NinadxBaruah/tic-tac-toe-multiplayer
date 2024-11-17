const express = require("express");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const cors = require("cors");
const configureWebSocket = require("./socket/index");
const multiplayer = require("./routes/http.route/multiplayer")
 

const PORT = process.env.PORT || 3000;
const app = express();

// Trust the first proxy
app.set("trust proxy", 1);

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://ninadbaruah.me" // Use exact domain
        : "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);




// Add these headers explicitly
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});
app.use(express.json());

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// Other static files
app.use(express.static(path.resolve(__dirname, "public")));


app.get("/offlineGameBoard", (req , res) =>{
  res.render('offlineGameBoard');
});

app.use("/multiplayer", multiplayer);
app.use("/", (req, res) =>{
  res.render('index');
});


// 404 Page Not Found route
app.use((req, res, next) => {
  res.status(404).render("not-found", { title: "Page Not Found" });
});
// Start server
const server = app.listen(PORT, () => {
  console.log(`Server listening in the port: ${PORT}`);
});

// Configure WebSocket
configureWebSocket(server);
