import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/dashboards';

export function useOrgDashboard(month: string) {
  return useQuery({
    queryKey: ['orgDashboard', month],
    queryFn: () => dashboardApi.getOrgDashboard(month),
    staleTime: 30000, // 30 seconds
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useDepartmentDashboard(deptId: number | undefined, month: string) {
  console.log('useDepartmentDashboard - deptId:', deptId, 'month:', month, 'enabled:', !!deptId);
  
  return useQuery({
    queryKey: ['departmentDashboard', deptId, month],
    queryFn: () => {
      if (!deptId) throw new Error('Department ID is required');
      console.log('Making API call: GET /api/dashboards/department/' + deptId + '/?month=' + month);
      return dashboardApi.getDepartmentDashboard(deptId, month);
    },
    enabled: !!deptId,
    staleTime: 30000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function usePodContributions(podId: number | undefined, month: string) {
  // Validate month format before making request
  const isValidMonth = /^\d{4}-\d{2}$/.test(month);
  
  return useQuery({
    queryKey: ['podContributions', podId, month],
    queryFn: () => {
      if (!podId) throw new Error('Pod ID is required');
      if (!isValidMonth) {
        throw new Error(`Invalid month format: ${month}. Expected YYYY-MM`);
      }
      return dashboardApi.getPodContributions(podId, month);
    },
    enabled: !!podId && isValidMonth,
    staleTime: 30000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useEmployeeContributions(employeeId: number | undefined, month: string) {
  // Validate month format before making request
  const isValidMonth = /^\d{4}-\d{2}$/.test(month);
  
  return useQuery({
    queryKey: ['employeeContributions', employeeId, month],
    queryFn: () => {
      if (!employeeId) throw new Error('Employee ID is required');
      if (!isValidMonth) {
        throw new Error(`Invalid month format: ${month}. Expected YYYY-MM`);
      }
      return dashboardApi.getEmployeeContributions(employeeId, month);
    },
    enabled: !!employeeId && isValidMonth,
    staleTime: 30000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

