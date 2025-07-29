import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  otpSent: false,
  countries: [],
  selectedCountry: null,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setCountries: (state, action) => {
      state.countries = action.payload
    },
    setSelectedCountry: (state, action) => {
      state.selectedCountry = action.payload
    },
    setOtpSent: (state, action) => {
      state.otpSent = action.payload
    },
    loginSuccess: (state, action) => {
      state.isAuthenticated = true
      state.user = action.payload
      state.loading = false
      state.otpSent = false
    },
    updateUserName: (state, action) => {
      if (state.user) {
        state.user.name = action.payload
      }
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.otpSent = false
    },
  },
})

export const { setLoading, setCountries, setSelectedCountry, setOtpSent, loginSuccess, updateUserName, logout } =
  authSlice.actions

export default authSlice.reducer
