// src/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  withCredentials: true, // wajib, biar cookie ikut dikirim
});

export default api;
