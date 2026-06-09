import axios from "axios";

const API = "http://localhost:5000/api/wagons";

export const getWagons = () => axios.get(API);
export const addWagon = (data) => axios.post(API, data);
export const deleteWagon = (id) => axios.delete(`${API}/${id}`);