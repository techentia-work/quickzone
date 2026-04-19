import axiosClient from "./client/axios";
import { authAPI } from "./auth/auth.api"
import userProfileApi from "./user/user.api";
import productsApi from "./product/product.api";
import notificationsApi from "./notification/notification.api";
import categoryApi from "./category/category.api";

export {
    userProfileApi,
    axiosClient,
    authAPI,
    productsApi,
    notificationsApi,
    categoryApi,
}