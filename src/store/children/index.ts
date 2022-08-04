import {Child} from "../../types/children";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {State} from "../index";

type ChildCell = {
    child: Child | null
}

const initialState: ChildCell = {
    child: null
}

export const slice = createSlice({
    name: 'children',
    initialState,
    reducers: {
        setChild: (state: ChildCell, child: PayloadAction<Child>) => {
            state.child = child.payload
        },
        clearChild: (state: ChildCell) => {
            state.child = null
        }
    }
})

export const { setChild, clearChild } = slice.actions

export const selectChild = (app: State): Child | null => app.childReducer.child

export default slice.reducer