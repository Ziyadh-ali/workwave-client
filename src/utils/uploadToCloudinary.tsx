import { employeeAxios } from "../api/axios";




export const uploadToCloudinary = async (file: File): Promise<{url : string , type : "image" | "video" | "document"}> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await employeeAxios.post("/chat/upload", formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    if (!res.data.media) {
        throw new Error("Failed to upload media");
    }

    const data = res.data.media
    return data;
};