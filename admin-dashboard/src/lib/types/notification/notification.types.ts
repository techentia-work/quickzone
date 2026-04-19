export interface NotificationType {
    _id?: string;
    user?: string;
    isForAdmin: boolean;
    title: string;
    body: string;
    read: boolean;
    meta?: {
        type: string;
        depositId?: string;
        userId?: string;
        packageId?: string;
        investmentId?: string;
        amount?: string;
        currency?: string;
        adminNote?: string;
        [key: string]: any;
    };
    createdAt?: string;
    updatedAt?: string;
}