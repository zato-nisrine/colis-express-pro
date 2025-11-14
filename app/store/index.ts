import { combineReducers } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
const rootReducer = combineReducers({
    authReducer: authSlice
})

export default rootReducer