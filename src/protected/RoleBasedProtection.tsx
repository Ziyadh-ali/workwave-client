import { Navigate , Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

interface ProtectedRoutesProps {
    allowedRoles : string[];
    redirectPath : string;
}

const RbProtectedRoute : React.FC<ProtectedRoutesProps> = ({allowedRoles , redirectPath = "/unauthorized"}) => {
    const {employee } = useSelector((state : RootState)=>state.employee);

    if(!employee || !allowedRoles.includes(employee.role)) {
        return <Navigate to={redirectPath}  replace/>;
    }

    return <Outlet />;
}

export default RbProtectedRoute