import {configureStore} from "@reduxjs/toolkit";
import adminSlice from "./slices/adminSlice"
import employeeSlice from "./slices/employeeSlice"


export const store = configureStore({
    reducer : {
        admin : adminSlice,
        employee : employeeSlice
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;