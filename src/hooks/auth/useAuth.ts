import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../authConfig";
import { useDispatch } from "react-redux";
import { setUser, setAccessToken } from "../../store/auth/authSlice";
import { User } from "../../types/auth";
import { clearAuth } from "../../store/auth/authSlice";
import { AppDispatch } from "../../store";

export const useAuth = () => {
    const { instance } = useMsal();
    const dispatch: AppDispatch = useDispatch();

    const handleLogin = async () => {
        try {
        console.log('estoy aca')
        const response = await instance.loginPopup(loginRequest);
        
        const account = response.account;
        const accessToken = response.accessToken;
        console.log("Reponse", response);
        dispatch(setUser({
            name: account.name,
            email: account.username,
            jobTitle: account.idTokenClaims?.jobTitle,
        } as User));
        dispatch(setAccessToken(accessToken));
        
        // dispatch(fetchUserProfile());
        } catch (error) {
        console.error("Login failed:", error);
        }   
    };

    const handleLogout = () => {
        instance.logoutPopup();
        dispatch(clearAuth());
    };

    return {handleLogin, handleLogout};
}
