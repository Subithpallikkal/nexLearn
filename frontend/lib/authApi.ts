const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface SendOtpResponse {
  success: boolean;
  message: string;
}

interface VerifyOtpResponse {
  success: boolean;
  login: boolean;
  message: string;
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
}

interface CreateProfileResponse {
  success: boolean;
  access_token?: string;
  refresh_token?: string;
  message?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    mobile: string;
    qualification: string;
    profile_image: string;
  };
}

interface LogoutResponse {
  success: boolean;
  message: string;
}

export const authApi = {
  sendOtp: async (mobile: string): Promise<SendOtpResponse> => {
    const formData = new FormData();
    formData.append("mobile", mobile);
    
    const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: "POST",
      body: formData,
    });
    return response.json();
  },

  verifyOtp: async (mobile: string, otp: string): Promise<VerifyOtpResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, otp }),
    });
    return response.json();
  },

  createProfile: async (formData: FormData): Promise<CreateProfileResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      body: formData,
    });
    return response.json();
  },

  logout: async (token: string): Promise<LogoutResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    return response.json();
  },
};

export default authApi;
