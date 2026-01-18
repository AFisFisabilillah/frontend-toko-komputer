import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import axiosInstance from "../../adapters/axiosInstance.js";
export const loginUser = createAsyncThunk(
    "auth/login",
    async (arg, thunkAPI) => {
        try {
            const res = await axiosInstance.post('/login', {
                username: arg.username,
                password: arg.password,
            });
            localStorage.setItem("token", res.data.token);
            axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
            return res.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)


export const logoutUser = createAsyncThunk(
    "auth/logout",
    async (_, thunkAPI) => {
        try {
            const response  = await axiosInstance.delete("/logout");
        } catch (error) {
        } finally {
            localStorage.removeItem("token");
        }
    }
);

export const fetchProfile  = createAsyncThunk(
    "auth/fetchProfile",
    async (arg, thunkAPI) => {
        try {
            const res = await axiosInstance.get("/profile")
            return res.data;
        }catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)
export const auth = createSlice({
    name: 'auth',
    initialState: {
        user:{
            id:0,
            profile:"",
            fullname:"",
            username:"",
            phone:""
        },
        isAuthenticated: false,
        error: null,
        loading:false,
    },
    extraReducers:builder => {
        builder
            .addCase(loginUser.pending,state => {
            state.isLoading = true;
            state.error=null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.error = action.payload?.message||"Login failed.";
            })
            .addCase(fetchProfile.pending, state => {
                state.isLoading = true;
            })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.data
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.error = action.payload?.message || "Failed fetch user";
            })
            .addCase(logoutUser.pending, state => {
                state.isLoading = true;
            })
            .addCase(logoutUser.fulfilled, state => {
                state.isLoading = false;
                state.isAuthenticated = false
            })
    }
})