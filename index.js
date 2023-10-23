const express = require("express");
const cors = require("cors");
const { dbConection } = require("./src/config/db");

const app = express();

app.use(cors());
app.use(express.json());
const userRoutes = require("./src/routes/users.routes");
app.use("/users", userRoutes);
// app.get("/demo", function (req, res) {
//   res.status(200).json({
//     data: "hello",
//   });
// });

dbConection.on(
  "error",
  console.error.bind(console, "Mongodb connection error")
);

dbConection.once("open", () => {
  console.log("db connected");
});

app.listen(4000, function (err) {
  if (err) console.log(err);
  console.log("app running");
});
