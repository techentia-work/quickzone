import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface InitialState {
    navOpen: boolean;
}

const initialState: InitialState = {
    navOpen: false,
}

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        setNavOpen: (state, action: PayloadAction<boolean>) => {
            state.navOpen = action.payload;
        }
    }
})

export const { setNavOpen, } = uiSlice.actions;

export default uiSlice.reducer;