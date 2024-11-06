import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    tasks: [],
    loading: false,
    error: null,
    userRole: null, 
};

const taskSlice = createSlice({
    name: "task",
    initialState,
    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setTasks: (state, action) => {
            state.tasks = action.payload;
            state.error = null;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setRepresentativeTasks: (state, action) => {
            state.tasks = action.payload;
        },
        setUserRole: (state, action) => {
            state.userRole = action.payload;
        }
    },
});

export const {
    setLoading,
    setTasks,
    setError,
    addTask,
    updateTask,
    deleteTask,
    setUserRole,
} = taskSlice.actions;

export default taskSlice.reducer;
