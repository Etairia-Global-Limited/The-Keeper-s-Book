export interface ApiResponse<T>{
    data: T | null,
  statusCode: number
    message: string
}

export interface MetaResponse{
 total: number;
    page: number;
    pageSize: number;
    totalPages: number; 
}

export interface PaginatedResponse<T>{
    data: T | null,
  statusCode: number
    message: string
    meta: MetaResponse
}

export interface SuccessResponse{
  statusCode: number
    message: string
}

export interface LoginResopnse{
      access_token: string;
  refresh_token: string;
  username: string;
  userId: string;
  roleId: string;
  statusCode: number
}

export interface ErrorResponse{
     statusCode: number;
  message: string;
  error: string;
  userId?: string;
  details?: any;
}

export interface ApplicationRow {
  id: string;
  name: string;
  description: string | null;
  environment: string;
  supportMail: string;
  status: 'Active' | 'Inactive';
  client: string;
  totalRoles: number;
  totalUsers: number;
}

export interface OwnerModel{
  id: string,
    name: string,
    email: string,
    status: string,
    contact: string,
    onboardedDate: string,
    isAdmin: boolean,
    isActive: boolean,
    createdAt: string,
    updatedAt: string,
    totalApplications: number,
    totalApplicationUsers: number
}

export interface  ClientRow {
id     :string        ,
  name   :string,
  email  :string ,
  status: string,
  contact:string
  onboardedDate:string
  isAdmin: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  totalApplications: number,
  totalApplicationUsers: number
}