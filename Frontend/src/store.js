import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice"; 
import taskReducer from "./slices/taskSlice";
import customerReducer from "./slices/customerSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    task:  taskReducer,
    customers: customerReducer, 
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
