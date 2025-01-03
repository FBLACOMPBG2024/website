import axios from "axios";

export const API_URL = process.env.API_URL;

// Create an axios instance
// This instance will be used to make all API requests
// It will include the base URL and other configurations

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
