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
  role: 'CEO' | 'HOD' | 'PodLead' | 'Employee' | 'Admin' | 'Automation';
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

// Allocation types
export type AllocationStatus = 'PENDING' | 'SUBMITTED' | 'PROCESSED';

export interface PodLeadAllocation {
  id: number;
  employee_id: number;
  employee_code: string;
  employee_name: string;
  email: string;
  product: string;
  product_description: string;
  academy_percent: number;
  intensive_percent: number;
  niat_percent: number;
  features_text?: string | null;
  is_verified_description: boolean;
  baseline_hours: number;
  status: AllocationStatus;
  total_percent: number;
}

export interface AllocationSheetResponse {
  pods: Array<{
    pod_id: number;
    pod_name: string;
    pod_lead_code: string;
    download_url: string;
    media_url: string;
  }>;
}

export interface AllocationSheetInfo {
  pod_id: number;
  pod_name: string;
  pod_lead_code: string;
  download_url: string;
  media_url: string;
}

export interface AllocationSubmissionItem {
  employee_id: number;
  product: string;
  product_description: string;
  academy_percent: number;
  intensive_percent: number;
  niat_percent: number;
  is_verified_description: boolean;
}

export interface SubmitAllocationRequest {
  month: string;
  allocations: AllocationSubmissionItem[];
}

export interface SubmitAllocationResponse {
  summary: {
    updated_allocations: number;
    error_count: number;
  };
  allocations: PodLeadAllocation[];
  errors: Array<{
    employee_id?: number;
    product?: string;
    message: string;
  }>;
  has_errors: boolean;
}

export interface ProcessAllocationsResponse {
  processed_count: number;
  output_format: 'records' | 'csv';
  created_records: number;
  message: string;
}

export interface FinalMasterListResponse {
  file_path: string;
  download_url: string;
  month: string;
  filename: string;
  exists?: boolean;
}

// Admin upload types
export interface InitialXLSXUploadResponse {
  summary: {
    generated_sheets: number;
    created_allocations: number;
    month: string;
    total_employees: number;
    total_pods_in_file: number;
    pods_with_sheets: number;
    pods_skipped: number;
    teams_processed: number;
  };
  teams: Array<{
    department: string;
    pods_with_sheets: number;
    pods_skipped: number;
    pods: Array<{
      pod_id: number;
      pod_name: string;
      pod_lead_code: string;
      sheet_path: string;
      download_url: string;
    }>;
    skipped_pods: Array<{
      pod_name: string;
      employee_count: number;
      reason: string;
    }>;
  }>;
  errors: Array<{
    sheet?: string;
    row: number;
    field: string;
    message: string;
  }>;
  has_errors: boolean;
}

export interface AdminUploadResponse {
  summary: {
    generated_sheets?: number;
    created_allocations?: number;
    created_employees?: number;
    updated_employees?: number;
    created_departments?: number;
    created_pods?: number;
    month?: string;
  };
  sheets?: Array<{
    pod_id: number;
    pod_name: string;
    pod_lead_code: string;
    sheet_path: string;
    download_url: string;
  }>;
  errors: Array<{
    sheet?: string;
    row: number;
    field: string;
    message: string;
  }>;
  has_errors: boolean;
}

export interface EmployeeImportResponse {
  summary: {
    created_employees: number;
    updated_employees: number;
    created_departments: number;
    created_pods: number;
  };
}

export interface GenerateSheetsResponse {
  success: boolean;
  data: {
    summary: {
      generated_sheets: number;
      month: string;
    };
    sheets: Array<{
      pod_id: number;
      pod_name: string;
      pod_lead_code: string;
      sheet_path: string;
      download_url: string;
    }>;
  };
  message?: string;
}

