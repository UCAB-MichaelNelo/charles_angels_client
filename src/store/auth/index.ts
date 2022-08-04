import { createSlice } from "@reduxjs/toolkit"
import {State} from "../index";

interface AuthenticationState {
    loggedIn: boolean | null
}

const initialState: AuthenticationState = {
    loggedIn: null
}

export const slice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLoggedIn: (state: AuthenticationState) => {
            state.loggedIn = true
        },
        setLoggedOut: (state: AuthenticationState) => {
            state.loggedIn = false
        }
    }
})

export const { setLoggedIn, setLoggedOut } = slice.actions

export const selectedLoggedIn = (app: State): boolean | null => app.authReducer.loggedIn

export default slice.reducer