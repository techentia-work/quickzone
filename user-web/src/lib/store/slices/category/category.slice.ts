// store/slices/category.slice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface InitialState {
    selectedMasterCategoryId: string | null;
}

const initialState: InitialState = {
    selectedMasterCategoryId: null,
}

const categorySlice = createSlice({
    name: "category",
    initialState,
    reducers: {
        setSelectedMasterCategory: (state, action: PayloadAction<string | null>) => {
            state.selectedMasterCategoryId = action.payload;
        },
        clearSelectedCategory: (state) => {
            state.selectedMasterCategoryId = null;
        }
    }
})

export const { setSelectedMasterCategory, clearSelectedCategory } = categorySlice.actions;

export default categorySlice.reducer;