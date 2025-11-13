import { apiClient } from './client';
import { API_BASE_URL, STORAGE_KEYS } from './config';
import type { UploadResponse } from './types';

export const uploadApi = {
  async uploadCSV(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.postFormData<UploadResponse>('/uploads/csv/', formData);
    return response.data;
  },

  async getUploadDetails(rawFileId: number): Promise<UploadResponse> {
    const response = await apiClient.get<UploadResponse>(`/uploads/${rawFileId}/`);
    return response.data;
  },

  async downloadFile(rawFileId: number): Promise<Blob> {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const response = await fetch(`${API_BASE_URL}/uploads/${rawFileId}/download/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    return response.blob();
  },

  async downloadErrors(rawFileId: number): Promise<Blob> {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const response = await fetch(`${API_BASE_URL}/uploads/${rawFileId}/errors/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download errors file');
    }

    return response.blob();
  },
};

