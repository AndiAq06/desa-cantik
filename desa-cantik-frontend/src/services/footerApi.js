import { apiClient } from "./apiClient";

export const footerApi = {
    get: async () => {
        const res = await apiClient.get("/footer");
        return res.data;
    },
    update: async (data) => {
        const res = await apiClient.post("/footer", data);
        return res.data;
    },
};
