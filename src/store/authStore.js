import { create } from "zustand";

export const useAuthStore = create((set) => ({
  
  loginData: {
    email: "",
    password: "",
  },
  setLoginData: (data) => set((state) => ({ loginData: { ...state.loginData, ...data } })),
  resetLoginData: () => set({ loginData: { email: "", password: "" } }),

  signupData: {
    businessName: "",
    businessType: "",
    businessDescription: "",
    businessAddress: "",
    city: "",
    region: "",
    businessPhone: "",
    businessEmail: "",
    taxId: "",
    password: "",
    confirmPassword: "",
  },
  setSignupData: (data) => set((state) => ({ signupData: { ...state.signupData, ...data } })),
  resetSignupData: () => set({
    signupData: {
      businessName: "",
      businessType: "",
      businessDescription: "",
      businessAddress: "",
      city: "",
      region: "",
      businessPhone: "",
      businessEmail: "",
      taxId: "",
      password: "",
      confirmPassword: "",
    }
  }),

  step: 1,
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: state.step - 1 })),
}));