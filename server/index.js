const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
// dotenv.config();

mongoose
  .connect("mongodb://localhost:27017/stoneDB")
  .then(() => {
    console.log("Connected to stoneDB");
  })
  .catch((e) => {
    console.log(e);
  });

//當發送images的路由時,會導向uploads資料夾
app.use("/images", express.static("uploads"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));

app.use("/api/item", require("./routes/item-route"));

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
