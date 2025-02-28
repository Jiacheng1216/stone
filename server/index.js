const express = require("express");
const app = express();
const mongoose = require("mongoose");
// dotenv.config();

mongoose
  .connect("mongodb://localhost:27017/stoneDB")
  .then(() => {
    console.log("Connected to stoneDB");
  })
  .catch((e) => {
    console.log(e);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
