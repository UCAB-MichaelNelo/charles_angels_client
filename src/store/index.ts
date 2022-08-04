import { configureStore } from "@reduxjs/toolkit";
import houseReducer from "./house"
import childReducer from "./children"
import indexHouseReducer from "./indexHouse"
import reportsReducer from "./reports"
import authReducer from "./auth"
import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";

const store = configureStore({
    reducer: {
        houseReducer,
        childReducer,
        indexHouseReducer,
        reportsReducer,
        authReducer
    }
})

export type State = ReturnType<typeof store.getState>

export type Dispatch = typeof store.dispatch

export const useAppSelector: TypedUseSelectorHook<State> = useSelector

export const useAppDispatch: () => Dispatch = useDispatch

export default store