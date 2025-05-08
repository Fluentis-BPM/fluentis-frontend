// hooks/auth/useAuth.ts
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../authConfig";
import { useDispatch } from "react-redux";
import { setAccessToken, verifyToken, setError } from "../../store/auth/authSlice";
import { clearAuth } from "../../store/auth/authSlice";
import { AppDispatch } from "../../store";

export const useAuth = () => {
  const { instance } = useMsal();
  const dispatch: AppDispatch = useDispatch();

  const handleLogin = async () => {
    try {
      const response = await instance.loginPopup(loginRequest);
      const accessToken = response.accessToken;
      console.log("Response from MSAL:", response);

      // Guardar usuario y token en el slice

      dispatch(setAccessToken(accessToken));

      // Verificar el token con el backend
      dispatch(verifyToken(accessToken));
    } catch (error) {
      console.error("Login failed:", error);
      dispatch(setError("Error al iniciar sesión con Azure AD"));
    }
  };

  const handleLogout = () => {
    instance.logoutPopup();
    dispatch(clearAuth());
  };

  return { handleLogin, handleLogout };
};