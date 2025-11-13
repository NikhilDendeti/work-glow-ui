import { apiClient } from './client';
import { API_BASE_URL, STORAGE_KEYS } from './config';
import type {
  InitialXLSXUploadResponse,
  ProcessAllocationsResponse,
  FinalMasterListResponse,
  EmployeeImportResponse,
  AdminUploadResponse,
  GenerateSheetsResponse,
} from './types';

export const adminApi = {
  async uploadInitialXLSX(file: File, month: string): Promise<InitialXLSXUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('month', month);
    const response = await apiClient.postFormData<InitialXLSXUploadResponse>(
      '/automation/upload-initial-xlsx/',
      formData
    );
    return response.data;
  },

  async processAllocations(
    podId: number,
    month: string,
    outputFormat: 'records' | 'csv' = 'records'
  ): Promise<ProcessAllocationsResponse> {
    const response = await apiClient.post<ProcessAllocationsResponse>(
      `/admin/allocations/${podId}/process/?month=${month}&output_format=${outputFormat}`
    );
    return response.data;
  },

  async generateFinalMasterList(month: string): Promise<FinalMasterListResponse> {
    const response = await apiClient.post<FinalMasterListResponse>(
      `/admin/final-master-list/generate/?month=${month}`
    );
    return response.data;
  },

  async getFinalMasterList(month: string): Promise<FinalMasterListResponse> {
    const response = await apiClient.get<FinalMasterListResponse>(
      `/admin/final-master-list/?month=${month}`
    );
    return response.data;
  },

  async downloadFinalMasterList(month: string): Promise<void> {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const response = await fetch(
      `${API_BASE_URL}/admin/final-master-list/?month=${month}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to download final master list');
    }

    const data = await response.json();
    if (!data.success || !data.data?.download_url) {
      throw new Error('Master list not found');
    }

    // Remove /api prefix from download_url if present (since API_BASE_URL already includes /api)
    const downloadUrl = data.data.download_url.startsWith('/api/')
      ? data.data.download_url.replace(/^\/api/, '')
      : data.data.download_url;

    const downloadResponse = await fetch(`${API_BASE_URL}${downloadUrl}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!downloadResponse.ok) {
      throw new Error('Failed to download file');
    }

    const blob = await downloadResponse.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = data.data.filename || `final_master_list_${month}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  async importEmployeeMasterData(file: File): Promise<EmployeeImportResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.postFormData<EmployeeImportResponse>(
      '/admin/employees/import/',
      formData
    );
    return response.data;
  },

  async uploadFeatureCSV(file: File, month: string): Promise<AdminUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('month', month);
    const response = await apiClient.postFormData<AdminUploadResponse>(
      '/admin/features/upload/',
      formData
    );
    return response.data;
  },

  async generateAllPodSheets(month: string): Promise<GenerateSheetsResponse> {
    // Backend returns { success, data, message } directly
    // The API client returns ApiResponse<T>, but since the backend response
    // already matches GenerateSheetsResponse structure, we return it directly
    const response = await apiClient.post<GenerateSheetsResponse['data']>(
      `/admin/sheets/generate-all/?month=${month}`
    );
    console.log('generateAllPodSheets - API client response:', response);
    // The response from apiClient.post is ApiResponse<T>, which has { success, data, message }
    // But backend already returns this structure, so response IS the GenerateSheetsResponse
    // We need to return the full response object, not response.data
    return {
      success: response.success,
      data: response.data,
      message: response.message,
    } as GenerateSheetsResponse;
  },

  async downloadSheet(downloadUrl: string, filename: string): Promise<void> {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    
    // Handle media URLs (/media/...) - they should use base server URL without /api
    // Handle API URLs (/api/...) - remove /api prefix since API_BASE_URL already includes /api
    let fullUrl: string;
    if (downloadUrl.startsWith('/media/')) {
      // Media files are served from base server URL (without /api)
      const baseUrl = API_BASE_URL.replace('/api', '');
      fullUrl = `${baseUrl}${downloadUrl}`;
    } else if (downloadUrl.startsWith('/api/')) {
      // Remove /api prefix since API_BASE_URL already includes /api
      fullUrl = `${API_BASE_URL}${downloadUrl.replace(/^\/api/, '')}`;
    } else {
      // Default: append to API_BASE_URL
      fullUrl = `${API_BASE_URL}${downloadUrl}`;
    }
    
    const response = await fetch(fullUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download sheet');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};

