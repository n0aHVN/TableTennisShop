export type ApiResponse<T = unknown> = {
    success: boolean;
    statusCode: number;
    data?: T;
    message?: string;
    meta?: {
        total?: number;
        page?: number;
        pageSize?: number;
        totalPages?: number;
        hasNextPage?: boolean;
        hasPreviousPage?: boolean;
    };
    error?: {
        code: string; // e.g., "USER_NOT_FOUND"
        message: string;
        field?: string;
    };
};
