import { useSelector } from "react-redux";
import {RootState} from "../store/store";
import { Navigate,Outlet } from "react-router-dom";

export const AdminPublic = () => {
    const { admin } = useSelector((state: RootState) => state.admin);
    if(!admin){
        return <Outlet />;
    }
    
    return <Navigate to="/admin/dashboard" replace/>
};

export const EmployeePublic = () =>{
    const {employee} = useSelector((state : RootState)=> state.employee);

    if(!employee) {
        return <Outlet/>
    }

    return <Navigate to="/dashboard" replace/>
}