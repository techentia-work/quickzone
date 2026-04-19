export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data: T;
    error?: unknown;
}

export interface PaginationResponse {

}