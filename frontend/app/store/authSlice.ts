import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserDetails {
  firstName: string;
  lastName: string;
  email: string;
}

interface AuthState {
  step: number;
  phoneNumber: string;
  otp: string;
  userDetails: UserDetails;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  step: 1,
  phoneNumber: "",
  otp: "",
  userDetails: {
    firstName: "",
    lastName: "",
    email: "",
  },
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setStep: (state, action: PayloadAction<number>) => {
      state.step = action.payload;
      state.error = null;
    },
    setPhoneNumber: (state, action: PayloadAction<string>) => {
      state.phoneNumber = action.payload;
    },
    setOtp: (state, action: PayloadAction<string>) => {
      state.otp = action.payload;
    },
    setUserDetails: (state, action: PayloadAction<Partial<UserDetails>>) => {
      state.userDetails = { ...state.userDetails, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetAuth: () => initialState,
  },
});

export const {
  setStep,
  setPhoneNumber,
  setOtp,
  setUserDetails,
  setLoading,
  setError,
  resetAuth,
} = authSlice.actions;

export default authSlice.reducer;
