export interface User {
  id: string;
  email: string;
  role: 'admin' | 'doctor' | 'patient' | 'hospital' | 'implant';
  is_active: boolean;
  email_verified: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_role: string;
  user_id: string;
  email: string;
}

export interface RegistrationOption {
  role: 'patient' | 'doctor' | 'hospital' | 'implant';
  title: string;
  description: string;
  icon: string;
  endpoint: string;
  requires_approval: boolean;
}

