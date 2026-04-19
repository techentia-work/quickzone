// @/lib/config/category.schema.ts
import { FilterSchema } from '@/lib/types';

export const categoryFilterSchema: FilterSchema = {
  fields: {
    page: { type: 'number', label: 'Page' },
    limit: { type: 'number', label: 'Items per page' },
    sortBy: { type: 'string', label: 'Sort by' },
    sortOrder: { type: 'string', label: 'Sort order' },
    search: { type: 'string', label: 'Search' },
    
    type: { type: 'string', label: 'Category Type' },
    path: { type: 'string', label: 'Path' },
    isActive: { type: 'boolean', label: 'Active' },
    parent: { type: 'string', label: 'Parent Category' },
    level: { type: 'number', label: 'Level' },
  },
  defaultFilters: {
    page: 1,
    limit: 20,
    sortBy: 'name',
    sortOrder: 'asc',
    isActive: true,
    search: '',
  },
};