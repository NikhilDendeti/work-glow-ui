// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// API Error format
export interface ApiError {
  success: false;
  message: string;
  error_code?: string;
  errors?: Record<string, string[]>;
}

// Auth types
export interface LoginRequest {
  employee_code: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

export interface User {
  employee_code: string;
  employee_id?: number;
  role: 'CEO' | 'HOD' | 'PodLead' | 'Employee';
  department_id?: number;
  department_name?: string;
  pod_id?: number;
  pod_name?: string;
}

// Dashboard response types
export interface ProductResponse {
  product_id: number;
  product_name: string;
  hours: number;
  percent: number;
}

export interface DepartmentBreakdown {
  department_id: number;
  department_name: string;
  total_hours: number;
  products: ProductResponse[];
}

export interface OrgDashboardResponse {
  month: string;
  total_hours: number;
  products: ProductResponse[];
  department_breakdown?: DepartmentBreakdown[];
  top_departments?: Array<{
    department_id: number;
    department_name: string;
    hours: number;
  }>;
  top_pods?: Array<{
    pod_id: number;
    pod_name: string;
    hours: number;
    department_name?: string;
  }>;
}

export interface PodProductBreakdown {
  product_id: number;
  product_name: string;
  hours: number;
  percent: number;
}

export interface PodInDepartment {
  pod_id: number;
  pod_name: string;
  total_hours: number;
  products: PodProductBreakdown[];
}

export interface DepartmentDashboardResponse {
  department_id: number;
  department_name: string;
  month: string;
  total_hours: number;
  pods: PodInDepartment[];
  product_distribution?: ProductResponse[];
}

export interface EmployeeProductBreakdown {
  product_id: number;
  product_name: string;
  hours: number;
  percent: number;
}

export interface EmployeeInPod {
  employee_id: number;
  employee_code: string;
  employee_name: string;
  total_hours: number;
  products: EmployeeProductBreakdown[];
}

export interface PodContributionsResponse {
  pod_id: number;
  pod_name: string;
  month: string;
  total_hours: number;
  products: ProductResponse[];
  employees: EmployeeInPod[];
}

export interface FeatureResponse {
  feature_id: number;
  feature_name: string;
  hours: number;
  percent: number;
  description?: string;
}

export interface EmployeeContributionsResponse {
  employee_id: number;
  employee_code: string;
  employee_name: string;
  month: string;
  total_hours: number;
  products: EmployeeProductBreakdown[];
  features: FeatureResponse[];
}

// Upload types
export interface UploadSummary {
  total_rows: number;
  created_records: number;
  created_employees: number;
  created_departments: number;
  created_pods: number;
  created_products: number;
  created_features: number;
  error_count: number;
}

export interface UploadError {
  sheet?: string;
  row: number;
  field: string;
  message: string;
}

export interface UploadResponse {
  raw_file_id: number;
  summary: UploadSummary;
  errors: UploadError[];
  has_errors: boolean;
}

// Entity types
export interface Product {
  id: number;
  name: string;
}

export interface Feature {
  id: number;
  name: string;
  product_id: number;
  product_name: string;
  description?: string;
}

