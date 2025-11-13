export type Role = 'CEO' | 'HOD' | 'PodLead' | 'Employee' | 'Admin' | 'Automation';

export type Product = 'Academy' | 'Intensive' | 'NIAT';

// Re-export API types
export type {
  ApiResponse,
  ApiError,
  LoginRequest,
  TokenResponse,
  User,
  ProductResponse,
  OrgDashboardResponse,
  DepartmentDashboardResponse,
  PodContributionsResponse,
  EmployeeContributionsResponse,
  UploadResponse,
  UploadSummary,
  UploadError,
  Product as ProductEntity,
  Feature,
} from '@/lib/api/types';

// Legacy types for backward compatibility (will be transformed from API responses)
export interface ProductData {
  product: Product;
  hours: number;
  percent: number;
}

export interface OrgRollup {
  month: string;
  total_hours: number;
  products: ProductData[];
}

export interface PodData {
  pod_id: number;
  pod_name: string;
  hours: number;
  by_product: Record<Product, number>;
}

export interface DepartmentRollup {
  department: string;
  month: string;
  total_hours: number;
  pods: PodData[];
}

export interface FeatureData {
  name: string;
  hours: number;
  description: string;
}

export interface EmployeeContribution {
  employee_code: string;
  name: string;
  total_hours: number;
  by_product: Partial<Record<Product, number>>;
  features: FeatureData[];
}

export interface PodContributions {
  pod_id: number;
  pod_name: string;
  employees: EmployeeContribution[];
}
