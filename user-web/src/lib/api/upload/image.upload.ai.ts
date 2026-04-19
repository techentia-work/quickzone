import axiosClient from "../client/axios";

export type UploadedImage = {
    url: string;
    publicId: string;
};

export const imageApi = {
    uploadSingle: (formData: FormData) => axiosClient.post<UploadedImage>("/api/images/upload-single-image", formData, { headers: { "Content-Type": "multipart/form-data" }, }),
    uploadBulk: (formData: FormData) => axiosClient.post<UploadedImage[]>("/api/images/upload/bulk", formData, { headers: { "Content-Type": "multipart/form-data" }, }),
    delete: (publicId: string) => axiosClient.delete<{ message: string }>(`/api/images/delete/${publicId}`),
}

export default imageApi;