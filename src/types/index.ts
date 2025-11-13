export type Role = 'CEO' | 'HOD' | 'PodLead' | 'Employee';

export type Product = 'Academy' | 'Intensive' | 'NIAT';

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
