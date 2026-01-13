import {useDispatch, useSelector} from "react-redux";
import {useEffect} from "react";
import {fetchProfile} from "../features/auth/authSlice.js";
import {useNavigate} from "react-router";
import {LoadingOutlined} from "@ant-design/icons";
import {Spin} from "antd";

export function ProtectedRoute({children, redirectTo="/login"}) {
    const {loading, isAuthenticated} = useSelector(state => state.auth);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        if(token){
            dispatch(fetchProfile())
        }else{
            navigate({
                pathname: redirectTo,
            })
        }
    },[]);

    if(loading){
        return (
            <div className="fixed inset-0 bg-white bg-opacity-75 backdrop-blur-sm flex flex-col justify-center items-center z-50">
                <Spin indicator={<LoadingOutlined style={{ fontSize: 64, color: '#1890ff' }} spin />} />
                <p className="mt-4 text-lg text-gray-700 font-medium">Harap tunggu...</p>
                <p className="text-gray-500">Memuat data aplikasi</p>
            </div>
        )
    }

    if (isAuthenticated){
        return children;
    }

}