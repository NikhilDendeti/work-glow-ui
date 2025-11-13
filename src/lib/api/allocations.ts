import { apiClient } from './client';
import { API_BASE_URL, STORAGE_KEYS } from './config';
import type {
  AllocationSheetResponse,
  AllocationSheetInfo,
  PodLeadAllocation,
  SubmitAllocationRequest,
  SubmitAllocationResponse,
} from './types';

export const allocationApi = {
  async getAllocationSheet(podId: number, month: string): Promise<AllocationSheetInfo> {
    const response = await apiClient.get<AllocationSheetResponse>(
      `/pod-leads/${podId}/allocation-sheet/?month=${month}`
    );
    // Extract the first pod from the pods array (should only be one for a specific pod_id)
    const podInfo = response.data.pods?.[0];
    if (!podInfo) {
      throw new Error('Allocation sheet not found');
    }
    return podInfo;
  },

  async getPodAllocations(podId: number, month: string): Promise<PodLeadAllocation[]> {
    const response = await apiClient.get<PodLeadAllocation[]>(
      `/pod-leads/${podId}/allocations/?month=${month}`
    );
    return response.data;
  },

  async submitAllocations(
    podId: number,
    data: SubmitAllocationRequest
  ): Promise<SubmitAllocationResponse> {
    const response = await apiClient.post<SubmitAllocationResponse>(
      `/pod-leads/${podId}/allocations/submit/`,
      data
    );
    return response.data;
  },

  async downloadAllocationSheet(podId: number, month: string): Promise<void> {
    // Direct download endpoint - returns Excel file
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const response = await fetch(
      `${API_BASE_URL}/pod-leads/${podId}/allocation-sheet/download/?month=${month}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to download allocation sheet');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `allocation_sheet_pod_${podId}_${month}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};

