import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {State} from "../index";
import {House} from "../../types/houses";

type HouseCell = {
    house: House | null
}

const initialState: HouseCell = {
    house: null
}

export const slice = createSlice({
    name: 'house',
    initialState,
    reducers: {
        setHouse: (state: HouseCell, house: PayloadAction<House>) => {
            state.house = house.payload
        },
        clearHouse: (state: HouseCell) => {
            state.house = null
        }
    }
})

export const { setHouse, clearHouse } = slice.actions

export const selectHouse: (arg: State) => (House | null) = app => app.houseReducer.house

export default slice.reducer