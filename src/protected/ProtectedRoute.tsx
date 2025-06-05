import { useSelector } from "react-redux";
import {RootState} from "../store/store";
import { Navigate , Outlet } from "react-router-dom";

export const AdminProtect = () => {
    const {admin} = useSelector((state :RootState) => state.admin)
    if(!admin) {
        return <Navigate to="/admin/login" replace/>;
    }

    return <Outlet/>;
}

export const EmployeeProtect = () => {
    const {employee} = useSelector((state : RootState) => state.employee);

    if(!employee) {
        return <Navigate to="/login" replace/>
    }

    return <Outlet/>;
}