import { IPaginationMetaData } from '../types/pagination.types';

interface PaginationInput {
  totalItems: number;
  currentPage: number;
}

export function createPaginationMeta(
    {
        totalItems,
        currentPage,
    }:PaginationInput
): IPaginationMetaData {
    const pageSize = 24
    const totalPages = Math.ceil(totalItems/pageSize);
    return {
        totalItems,
        pageSize,
        currentPage,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
        nextPage: currentPage < totalPages ? currentPage + 1 : null,
        prevPage: currentPage > 1 ? currentPage - 1 : null,
    };
}