import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

/**
 * Default way of dispatching actions to the Redux store.
 *
 * Typed version of `useDispatch` from `react-redux`.
 */
export const useAppDispatch: () => AppDispatch = useDispatch;

/**
 * Default way of selecting data from the Redux store.
 *
 * Typed version of `useSelector` from `react-redux`.
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
