import api from "./api";

export default {
  async getSummary() {
    const { data } = await api.get("/dashboard/summary");
    return data; // { status, message, data: {...} }
  },
};
