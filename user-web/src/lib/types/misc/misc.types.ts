export type FilterType = 'string' | 'number' | 'boolean' | 'array' | 'date' | 'range';

export interface FilterField {
  type: FilterType;
  label?: string;
}

export interface FilterSchema {
  fields: Record<string, FilterField>;
  defaultFilters: Record<string, any>;
}

export type EntityType = 'product'
 | 'category'
  // | 'order' 
  // | 'featured';