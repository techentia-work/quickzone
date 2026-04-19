export type { RootState } from "./store"
export { store, useAppSelector, useAppDispatch } from "./store"

export {
    clearSelectedCategory, setSelectedMasterCategory,
} from "./slices"