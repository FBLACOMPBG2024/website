import axios from "axios";

export const API_URL = process.env.API_URL;

const createInstance = (baseUrl: string) => {
  return axios.create({
    baseURL: baseUrl,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export default createInstance(API_URL || "");
