import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import Axios from 'axios'
import { PURGE } from 'redux-persist'

const initialState = {
	status: 'idle',
	empire: null,
}

export const create = createAsyncThunk(
	'empire/created',
	async ({ values, game_id }, thunkAPI) => {
		try {
			console.log(values, game_id)
			// pass gameId as query param
			// const res = await Axios.post(`/empire?gameId=${gameId}`, values)
			const res = await Axios.post(`/empire?gameId=${game_id}`, values)
			// console.log(res)
			let data = res.data
			return data
		} catch (e) {
			const payload = e?.response?.data || { error: 'request failed' }
			return thunkAPI.rejectWithValue(payload)
		}
	}
)

export const fetchEmpire = createAsyncThunk(
	'empire/fetch',
	async ({ uuid }, thunkAPI) => {
		try {
			// console.log(values)
			const res = await Axios.get(`/empire/${uuid}`)
			const data = res.data
			// console.log(data)
			return {
				empire: data,
			}
		} catch (e) {
			const payload = e?.response?.data || { error: 'request failed' }
			return thunkAPI.rejectWithValue(payload)
		}
	}
)

export const createSession = createAsyncThunk(
	'empire/session',
	async ({ id }, thunkAPI) => {
		try {
			// console.log(id)
			const res = await Axios.post(`/session/${id}`)
			const data = res.data
			return data
		} catch (e) {
			console.log(e)
			return thunkAPI.rejectWithValue(e.response.data)
		}
	}
)

export const logoutEmpire = createAsyncThunk(
	'empire/logout',
	async (thunkAPI) => {
		try {
			return initialState
		} catch (e) {
			// console.log(e)
			return thunkAPI.rejectWithValue()
		}
	}
)

export const empireSlice = createSlice({
	name: 'empire',
	initialState: initialState,
	reducers: {
		empireLoaded: (state, { payload }) => ({
			empire: payload,
			status: 'succeeded',
		}),
		// turnsUsed(state, action) {
		// 	state = action.payload
		// },
		resetEmpire: () => initialState,
	},
	extraReducers: (builder) => {
		builder
			.addCase(create.pending, (state) => {
				state.status = 'loading'
			})
			.addCase(create.fulfilled, (state, action) => {
				state.status = 'succeeded'
				state.empire = action.payload
			})
			.addCase(fetchEmpire.pending, (state) => {
				state.status = 'loading'
			})
			.addCase(fetchEmpire.fulfilled, (state, action) => {
				state.status = 'succeeded'
				state.empire = action.payload.empire
			})
			.addCase(fetchEmpire.rejected, (state) => {
				state.status = 'failed'
				state.empire = null
			})
			.addCase(logoutEmpire.fulfilled, (state) => {
				state.status = 'idle'
				state.empire = null
			})
			.addCase(PURGE, () => initialState)
	},
})

export const { empireLoaded } = empireSlice.actions

export const empireSelector = (state) => state.empire
