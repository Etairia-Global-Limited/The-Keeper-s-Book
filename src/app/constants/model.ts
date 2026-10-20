export interface LoginPayload{
  "usernameOrEmail": string,
  "password": string
}

export interface SearchPayload{
  "page": number,
  "pageSize": number,
  "sortBy": string,
  "sortOrder": string,
  "filter": string,
  "keyword": string
}

export interface CreateApplicationPayload{
  "name": string,
  "supportMail": string,
  "ownerId": string,
  "description": string,
  "environment": string,
  "redirectUrl": string,
  "applicationStatus": string,
}

export interface CreateOwnerPayload {
  "name": string,
  "email": string,
  "contact": string,
  "isAdmin": boolean
}

export interface IdPayload{
  "id": string
}

export interface UpdateApplicationPayload extends Partial<CreateApplicationPayload>{
  id: string;
}