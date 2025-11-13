import { apiClient } from './client';
import type { Product, Feature } from './types';

export const entityApi = {
  async getProducts(): Promise<Product[]> {
    const response = await apiClient.get<Product[]>('/products/');
    return response.data;
  },

  async getFeatures(productId?: number): Promise<Feature[]> {
    const url = productId ? `/features/?product_id=${productId}` : '/features/';
    const response = await apiClient.get<Feature[]>(url);
    return response.data;
  },
};

