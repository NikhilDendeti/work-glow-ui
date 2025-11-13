import { OrgRollup, DepartmentRollup, PodContributions } from '@/types';

export const mockOrgData: OrgRollup = {
  month: '2025-10',
  total_hours: 12345.0,
  products: [
    { product: 'Academy', hours: 6000.0, percent: 48.6 },
    { product: 'Intensive', hours: 4000.0, percent: 32.4 },
    { product: 'NIAT', hours: 2345.0, percent: 19.0 },
  ],
};

export const mockDepartmentData: DepartmentRollup = {
  department: 'Tech',
  month: '2025-10',
  total_hours: 4000.0,
  pods: [
    {
      pod_id: 12,
      pod_name: 'Platform Pod',
      hours: 1200.0,
      by_product: { Academy: 700, Intensive: 300, NIAT: 200 },
    },
    {
      pod_id: 13,
      pod_name: 'Frontend Pod',
      hours: 1500.0,
      by_product: { Academy: 900, Intensive: 400, NIAT: 200 },
    },
    {
      pod_id: 14,
      pod_name: 'Backend Pod',
      hours: 1300.0,
      by_product: { Academy: 600, Intensive: 500, NIAT: 200 },
    },
  ],
};

export const mockPodData: PodContributions = {
  pod_id: 12,
  pod_name: 'Platform Pod',
  employees: [
    {
      employee_code: 'TE1001',
      name: 'Alice Johnson',
      total_hours: 120,
      by_product: { Academy: 80, Intensive: 40 },
      features: [
        { name: 'Scheduler', hours: 40, description: 'Implemented job scheduling system' },
        { name: 'API Gateway', hours: 40, description: 'Enhanced API gateway routing' },
        { name: 'Monitoring', hours: 40, description: 'Added performance monitoring' },
      ],
    },
    {
      employee_code: 'TE1002',
      name: 'Bob Smith',
      total_hours: 110,
      by_product: { Academy: 70, Intensive: 40 },
      features: [
        { name: 'Database Migration', hours: 50, description: 'Migrated legacy databases' },
        { name: 'Cache Layer', hours: 60, description: 'Implemented Redis caching' },
      ],
    },
    {
      employee_code: 'TE1003',
      name: 'Carol Davis',
      total_hours: 100,
      by_product: { Academy: 60, NIAT: 40 },
      features: [
        { name: 'Authentication', hours: 50, description: 'Built OAuth2 authentication' },
        { name: 'User Management', hours: 50, description: 'Created user admin panel' },
      ],
    },
  ],
};

export const mockTopTeams = [
  { department: 'Tech', pod: 'Platform Pod', hours: 1200, percent: 30.0 },
  { department: 'Tech', pod: 'Frontend Pod', hours: 1500, percent: 37.5 },
  { department: 'Design', pod: 'UX Pod', hours: 800, percent: 20.0 },
  { department: 'Product', pod: 'Strategy Pod', hours: 500, percent: 12.5 },
];
