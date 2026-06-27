import axios from "axios";
import { Platform } from "react-native";

const API_URL = __DEV__
  ? Platform.select({
      android: "http://192.168.0.107:3000/api",
      ios: "http://192.168.0.107:3000/api",
      default: "http://localhost:3000/api"
    })
  : "https://bazar-app-dusky.vercel.app/api";

const api = axios.create({
  baseURL: API_URL
});

export default api;