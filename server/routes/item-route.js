const router = require("express").Router();
// const ItemValidation = require("../validation").itemValidation;
const multer = require("multer");
const path = require("path");
const itemModels = require("../models/item-models");

router.use((req, res, next) => {
  console.log("正在接收一個跟石頭有關的請求...");
  next();
});

//接收前端上傳的圖片
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

//上傳圖片的router
router.post("/postPhoto", upload.single("photo"), async (req, res) => {
  try {
    res.send(req.file);
  } catch (e) {
    return res.send(500).send("無法上傳圖片");
  }
});

//刊登商品的router
router.post("/", async (req, res) => {
  //確認資料是否符合規範
  // let { error } = ItemValidation(req.body);
  // if (error) return res.status(400).send(error.details[0].message);

  try {
    let { color, height, width, imagePath } = req.body;
    let postItem = new itemModels({
      color,
      height,
      width,
      imagePath,
    });

    let savedItem = await postItem.save();
    return res.send({
      msg: "成功刊登商品",
      savedItem,
    });
  } catch (e) {
    return res.status(500).send("無法儲存刊登的商品...");
  }
});

//刪除商品
router.delete("/delete/:id", async (req, res) => {
  try {
    const itemId = req.params.id;
    const deleteItem = await itemModels.findByIdAndDelete(itemId);
    if (!deleteItem) return res.status(404).json({ error: "商品未找到" });
    return res.send({
      msg: "刪除商品成功",
      deleteItem,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send("刪除商品時出錯");
  }
});

//查詢資料庫中所有商品
router.get("/showItems", async (req, res) => {
  try {
    const allItems = await itemModels.find();
    return res.send(allItems);
  } catch (e) {
    res.status(500).send("無法查詢所有商品");
  }
});

//以商品id來查詢商品
router.get("/findItem/:id", async (req, res) => {
  try {
    const itemId = req.params.id;
    const findItem = await itemModels.findById({ _id: itemId });
    res.send(findItem);
  } catch (e) {
    console.log(e);
  }
});

//編輯商品資訊
router.put("/edit/:id", async (req, res) => {
  const itemId = req.params.id;
  const { color, height, width, imagePath } = req.body;

  try {
    const item = await itemModels.findById(itemId);
    if (!item) {
      return res.status(404).send("商品未找到");
    }

    //更新商品資訊
    item.color = color;
    item.height = height;
    item.width = width;
    item.imagePath = imagePath;

    const updatedItem = await item.save();
    res.status(200).send({ msg: "更新商品成功!", updatedItem });
  } catch (e) {
    res.status(500).send("無法更新商品資訊");
  }
});

module.exports = router;
