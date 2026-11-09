export interface LoginPayload {
  usernameOrEmail: string;
  password: string;
}

export interface SearchPayload {
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: string;
  filter: string;
  keyword: string;
}

export interface DownloadPayload extends SearchPayload {
  format: string;
}

export interface CreateApplicationPayload {
  name: string;
  supportMail: string;
  ownerId: string;
  description: string;
  environment: string;
  redirectUrl: string;
  applicationStatus: string;
}

export interface CreateOwnerPayload {
  name: string;
  email: string;
  contact: string;
  address: string;
  country: string;
  status: string;
  isAdmin: boolean;
}

export interface IdPayload {
  id: string;
}

export interface UpdateApplicationPayload extends Partial<CreateApplicationPayload> {
  id: string;
}

export interface UpdateOwnerPayload extends Partial<CreateOwnerPayload> {
  id: string;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  username: string;
  roleId: string;
  phoneNumber: string;
  address: string;
  countryCode: string;
  applicationId: string;
}

export interface CreateRolePayload {
  name: string;
  description: string;
  applicationId: string;
}

export interface UpdateRolePayload extends Partial<CreateRolePayload> {
  id: string;
}

export interface BulkUsersPayload {
  ids: ['string'];
}

export interface UpdateUserPayload {
  applicationId?: string;
  userId?: string;
  roleId?: string;
  password?: string;
  countryCode?: string;
}

export interface CreateAppUserPayload {
  applicationId: string;
  userId: string;
  roleId: string;
  password: string;
  countryCode: string;
}

export interface UpdateAppUserPayload extends Partial<CreateAppUserPayload> {
  id: string;
}

export interface PasswordOptions {
  length: number;
  lowercase: boolean;
  uppercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

export interface SignInDay {
  date: string; // 'YYYY-MM-DD' (UTC)
  total: number;
  success: number;
  failed: number;
}

export interface AuditActivity {
  action: string;
  actor: string;
  target: string | null;
  actionStatus: string; // your ActionStatus enum value
  actionDate: string;
}

export interface DashboardData {
  application: number;
  user: number;
  owner: number;
  failedLogin24h: number;
  signInChart: SignInDay[];
  recentActivities: AuditActivity[];
}

export interface CreateApplicationClientPayload {
  clientId: string;
  description: string;
  applicationId: string;
}
