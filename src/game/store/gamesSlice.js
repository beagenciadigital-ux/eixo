import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import Axios from 'axios'
import { PURGE } from 'redux-persist'

export const fetchGames = createAsyncThunk(
	'games/fetch',
	async (_, thunkAPI) => {
		try {
			const { data } = await Axios.get('/games/games')
			return Array.isArray(data) ? data : []
		} catch (e) {
			return thunkAPI.rejectWithValue(e.response?.data)
		}
	}
)

export const createGame = createAsyncThunk(
	'games/create',
	async (payload, thunkAPI) => {
		try {
			await Axios.post('/admin/creategame', payload)
			const { data } = await Axios.get('/games/games')
			const games = Array.isArray(data) ? data : []
			return { games }
		} catch (e) {
			return thunkAPI.rejectWithValue(e.response?.data)
		}
	}
)

const initialState = {
	games: null,
	activeGame: null,
	status: 'idle',
}
export const gamesSlice = createSlice({
	name: 'games',
	initialState: initialState,
	reducers: {
		setActiveGame: (state, action) => {
			return {
				games: state.games,
				activeGame: action.payload,
			}
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(createGame.pending, (state) => {
				state.status = 'loading'
			})
			.addCase(createGame.fulfilled, (state, action) => {
				state.games = action.payload.games
				state.status = 'succeeded'
			})
			.addCase(fetchGames.pending, (state) => {
				state.status = 'loading'
			})
			.addCase(fetchGames.fulfilled, (state, action) => {
				state.games = Array.isArray(action.payload) ? action.payload : []
				state.status = 'succeeded'
			})
			.addCase(fetchGames.rejected, (state) => {
				state.games = []
				state.status = 'failed'
			})
			.addCase(PURGE, () => initialState)
	},
})

export const gamesSelector = (state) => state.games
export const { setActiveGame } = gamesSlice.actions
