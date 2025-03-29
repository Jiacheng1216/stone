import axios from "axios";
import { ip } from "../config";
const API_URL = `${ip}/api/item`;

class ItemService {
  //上傳商品
  post(color, height, width, imagePath) {
    let token;
    // if (localStorage.getItem("user")) {
    //   token = JSON.parse(localStorage.getItem("user")).token;
    // } else {
    //   token = "";
    // }

    return axios.post(
      API_URL,
      { color, height, width, imagePath }
      // {
      //   headers: {
      //     Authorization: token,
      //   },
      // }
    );
  }

  //上傳商品照片
  postPhoto(fd) {
    return axios.post(API_URL + "/postPhoto", fd, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  //查詢所有商品
  get() {
    return axios.get(API_URL + "/showItems");
  }

  // //查詢個人商品
  // getSelf(id) {
  //   return axios.get(API_URL + "/selfItems/" + id);
  // }

  //刪除商品
  deleteItem(id) {
    return axios.delete(API_URL + "/delete/" + id);
  }

  //查詢單一顏色商品
  getByColor(color) {
    return axios.get(API_URL + "/folder/" + color);
  }

  //編輯個別商品
  editItem(color, height, width, imagePath, id) {
    return axios.put(API_URL + "/edit/" + id, {
      color,
      height,
      width,
      imagePath,
    });
  }
}

export default new ItemService();
