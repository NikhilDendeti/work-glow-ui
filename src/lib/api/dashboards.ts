import { apiClient } from './client';
import type {
  OrgDashboardResponse,
  DepartmentDashboardResponse,
  PodContributionsResponse,
  EmployeeContributionsResponse,
} from './types';

export const dashboardApi = {
  async getOrgDashboard(month: string): Promise<OrgDashboardResponse> {
    const response = await apiClient.get<OrgDashboardResponse>(
      `/dashboards/org/?month=${month}`
    );
    return response.data;
  },

  async getDepartmentDashboard(
    deptId: number,
    month: string
  ): Promise<DepartmentDashboardResponse> {
    const endpoint = `/dashboards/department/${deptId}/?month=${month}`;
    console.log('dashboardApi.getDepartmentDashboard - Calling:', endpoint);
    const response = await apiClient.get<DepartmentDashboardResponse>(endpoint);
    console.log('dashboardApi.getDepartmentDashboard - Response:', response);
    return response.data;
  },

  async getPodContributions(
    podId: number,
    month: string
  ): Promise<PodContributionsResponse> {
    const endpoint = `/pods/${podId}/contributions/?month=${month}`;
    console.log('dashboardApi.getPodContributions - Calling:', endpoint);
    const response = await apiClient.get<PodContributionsResponse>(endpoint);
    console.log('dashboardApi.getPodContributions - Response:', response);
    return response.data;
  },

  async getEmployeeContributions(
    employeeId: number,
    month: string
  ): Promise<EmployeeContributionsResponse> {
    const endpoint = `/employees/${employeeId}/contributions/?month=${month}`;
    console.log('dashboardApi.getEmployeeContributions - Calling:', endpoint);
    const response = await apiClient.get<EmployeeContributionsResponse>(endpoint);
    console.log('dashboardApi.getEmployeeContributions - Response:', response);
    return response.data;
  },
};

