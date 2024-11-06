import { createSlice } from '@reduxjs/toolkit';

// Define the initial state for customers
const initialState = {
  customers: [],  // An array to store customer data
  loading: false,  // To track the loading state
  error: null,  // To store any error messages
};

// Create a slice for customers
const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    // Action to set the customers data
    setCustomers: (state, action) => {
      state.customers = action.payload;
      state.loading = false;
    },
    // Action to set loading state
    setLoading: (state) => {
      state.loading = true;
    },
    // Action to handle error
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

// Export the actions
export const { setCustomers, setLoading, setError } = customerSlice.actions;

// Export the reducer to be included in the store
export default customerSlice.reducer;
