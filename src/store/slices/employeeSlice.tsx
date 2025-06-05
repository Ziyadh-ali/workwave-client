import { createSlice , PayloadAction } from "@reduxjs/toolkit";
import socket from "../../utils/socket";

interface Employee {
    _id : string,
    email : string,
    role : string,
    profilePic : string,
    fullName : string
}

interface EmployeeState {
    employee : Employee | null;
}

const initialState : EmployeeState = {
    employee : JSON.parse(localStorage.getItem("employeeSession") || "null"),
}

const employeeSlice = createSlice({
    name : "employee",
    initialState,
    reducers : {
        employeeLogin : (state , action : PayloadAction<Employee>) => {
            state.employee = action.payload;
            socket.connect();
            localStorage.setItem("employeeSession" , JSON.stringify(action.payload));
        },
        employeeLogout : (state) => {
            state.employee = null;
            socket.disconnect();
            localStorage.removeItem("employeeSession");
        }
    }
});

export const {employeeLogin , employeeLogout} = employeeSlice.actions;
export default employeeSlice.reducer;