import axios from "axios";
import { ip } from "../config";
const API_URL = `${ip}/api/item`;

class ItemService {
  //上傳商品
  post(
    color,
    height,
    width,
    imagePath,
    imagePublicId,
    isPaper,
    firstLastNumbers,
    fileName,
    stoneOrigin
  ) {
    // let token;
    // if (localStorage.getItem("user")) {
    //   token = JSON.parse(localStorage.getItem("user")).token;
    // } else {
    //   token = "";
    // }

    return axios.post(
      API_URL,
      {
        color,
        height,
        width,
        imagePath,
        imagePublicId,
        isPaper,
        firstLastNumbers,
        fileName,
        stoneOrigin,
      }
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
  deleteItem(ids) {
    return axios.delete(API_URL + "/delete/", {
      data: { ids },
    });
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

  uploadMultiple(formData, onUploadProgress) {
    return axios.post(`${API_URL}/upload-multiple`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    });
  }
}

export default new ItemService();
