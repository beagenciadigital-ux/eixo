import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import Axios from 'axios'
import { PURGE } from 'redux-persist'
import { axiosSessionCheckConfig } from '../config/apiOrigin'
// const initialState = user
// 	? { isLoggedIn: true, user }
// 	: { isLoggedIn: false, user: null }

const initialState = {
	isLoggedIn: false,
	user: null,
}

export const register = createAsyncThunk(
	'user/register',
	async (values, thunkAPI) => {
		try {
			const response = await Axios.post(`/auth/register?lang=${values.language}`, values)
			// console.log(response)
			let data = response.data
			console.log('data', data)
			return { data }
			// redirect to login page
		} catch (e) {
			// console.log(e)
			return thunkAPI.rejectWithValue(e.response?.data ?? { error: e.message })
		}
	}
)

export const demo = createAsyncThunk('user/demo', async (values, thunkAPI) => {
	try {
		const res = await Axios.post('/auth/demo')
		// console.log(res)
		let data = res.data
		return { user: data }
	} catch (e) {
		// console.log(e.response.data)
		return thunkAPI.rejectWithValue(e.response.data)
	}
})

export const login = createAsyncThunk(
	'user/login',
	async (values, thunkAPI) => {
		try {
			// console.log(values)
			const res = await Axios.post(`/auth/login?lang=${values.language}`, values)
			// console.log(res)
			let data = res.data
			return { user: data }
		} catch (e) {
			// console.log(e)
			return thunkAPI.rejectWithValue(e.response.data)
		}
	}
)

export const load = createAsyncThunk('user/load', async (_, thunkAPI) => {
	try {
		const res = await Axios.get('/auth/me', axiosSessionCheckConfig)
		if (res.status === 401) {
			return thunkAPI.rejectWithValue(null)
		}
		return { user: res.data }
	} catch (e) {
		return thunkAPI.rejectWithValue(null)
	}
})

export const logout = createAsyncThunk('user/logout', async (thunkAPI) => {
	try {
		await Axios.get('/auth/logout')
		return initialState
	} catch (e) {
		// console.log(e)
		return thunkAPI.rejectWithValue()
	}
})

export const userSlice = createSlice({
	name: 'user',
	initialState: initialState,
	reducers: {
		userLoaded: (state, { payload }) => ({
			isLoggedIn: true,
			user: payload,
		}),
		resetUser: (state) => initialState,
	},
	extraReducers: (builder) => {
		builder
			.addCase(register.fulfilled, (state) => {
				state.isLoggedIn = false
			})
			.addCase(register.rejected, (state) => {
				state.isLoggedIn = false
			})
			.addCase(demo.fulfilled, (state, action) => {
				state.isLoggedIn = true
				state.user = action.payload.user
			})
			.addCase(login.fulfilled, (state, action) => {
				state.isLoggedIn = true
				state.user = action.payload.user
			})
			.addCase(login.rejected, (state) => {
				state.isLoggedIn = false
				state.user = null
			})
			.addCase(load.fulfilled, (state, action) => {
				state.isLoggedIn = true
				state.user = action.payload.user
			})
			.addCase(load.rejected, (state) => {
				state.isLoggedIn = false
				state.user = null
			})
			.addCase(logout.fulfilled, (state) => {
				state.isLoggedIn = false
				state.user = null
			})
			.addCase(PURGE, () => initialState)
	},
})

export const userSelector = (state) => state.user

export const { userLoaded, resetUser } = userSlice.actions
