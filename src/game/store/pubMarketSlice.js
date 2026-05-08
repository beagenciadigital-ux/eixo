import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import Axios from 'axios'

export const fetchMyItems = createAsyncThunk(
	'market/myItems',
	async (values, thunkAPI) => {
		try {
			// console.log(values)
			const res = await Axios.post('/publicMarket/pubSellMine', values)
			// console.log(res)
			const data = res.data
			return data
		} catch (e) {
			console.log(e)
			return thunkAPI.rejectWithValue()
		}
	}
)

export const fetchOtherItems = createAsyncThunk(
	'market/otherItems',
	async ({ empireId, gameId }, thunkAPI) => {
		try {
			// console.log('fetchOtherItems')
			// console.log(empireId, gameId)
			const body = { empireId: empireId }
			// console.log(body)
			const res = await Axios.post(
				`/publicMarket/pubSellOthers?gameId=${gameId}`,
				body
			)
			const data = res.data
			// console.log(data)
			return data
		} catch (e) {
			console.log(e)
			return thunkAPI.rejectWithValue()
		}
	}
)

export const pubMarketSlice = createSlice({
	name: 'market',
	initialState: {
		statusMine: 'idle',
		statusOthers: 'idle',
		myItems: [],
		otherItems: {
			arm: [{ amount: 0, price: 0, type: 0 }],
			lnd: [{ amount: 0, price: 0, type: 0 }],
			fly: [{ amount: 0, price: 0, type: 0 }],
			sea: [{ amount: 0, price: 0, type: 0 }],
			food: [{ amount: 0, price: 0, type: 0 }],
			runes: [{ amount: 0, price: 0, type: 0 }],
		},
	},
	reducers: {
		myItemsLoaded: (state, { payload }) => ({
			myItems: payload,
			statusMine: 'succeeded',
		}),
		otherItemsLoaded: (state, { payload }) => ({
			otherItems: payload,
			statusOthers: 'succeeded',
		}),
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchMyItems.pending, (state) => {
				state.statusMine = 'loading'
			})
			.addCase(fetchMyItems.fulfilled, (state, action) => {
				state.statusMine = 'succeeded'
				state.myItems = action.payload
			})
			.addCase(fetchOtherItems.pending, (state) => {
				state.statusOthers = 'loading'
			})
			.addCase(fetchOtherItems.fulfilled, (state, action) => {
				state.statusOthers = 'succeeded'
				state.otherItems = action.payload
			})
	},
})

export const { myItemsLoaded } = pubMarketSlice.actions
export const { otherItemsLoaded } = pubMarketSlice.actions

export const marketSelector = (state) => state.market
