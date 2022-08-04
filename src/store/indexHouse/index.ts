import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {State} from "../index";
import {HouseSelection} from "../../types/children";

type IndexHouse = {
    house: HouseSelection | null
}

const initialState: IndexHouse = {
    house: null
}

export const slice = createSlice({
    name: 'indexHouse',
    initialState,
    reducers: {
        setIndexHouse(state: IndexHouse, house: PayloadAction<HouseSelection>) {
            state.house = house.payload
        }
    }
})

export const { setIndexHouse } = slice.actions

export const selectIndexHouse: (arg: State) => (HouseSelection | null) = app => app.indexHouseReducer.house

export default slice.reducer