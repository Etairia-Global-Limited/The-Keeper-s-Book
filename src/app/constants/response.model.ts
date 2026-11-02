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

export interface UserProfileDto {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  profileImageUrl: string | null;
  isActive: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserRow {
  id: string;
  email: string;
  username: string;
  isActive: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  userProfile: UserProfileDto;
}

export interface ApplicationRoleRow {
  id: string,
  name: string;
  description: string | null;
  applicationName: string;
  totalUsers: number;
  status: string; // use your Prisma enum type if status is an enum, e.g. RoleStatus
}

export interface ApplicationUserRow {
  id: string;
  user: string;
  email: string;
  application: string;
  role: string;
  lastAccess: string;
  status: string;
}

export interface DownloadedFile {
  __file: true;
  name: string;
  type: string;
  data: string; // base64
}