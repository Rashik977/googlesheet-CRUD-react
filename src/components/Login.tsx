import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { getUserRole } from "../api/RoleAPI";

const Login = () => {
  const { login } = useAuth();
  let navigate = useNavigate();

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      const decoded = jwtDecode<{
        email: string;
      }>(credentialResponse.credential!);

      const email = decoded.email;

      // Fetch role and permissions
      const { role, permissions } = await getUserRole(email);

      const userData = {
        email,
        role,
        permissions,
      };

      // Save user data in context
      login(userData);

      navigate("/dashboard");
    } catch (error) {
      console.error("Error fetching user role or permissions:", error);
      alert("Login failed. Please contact your administrator.");
    }
  };

  const handleError = () => {
    console.log("Login Failed");
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="min-h-screen w-1/2">
        <img src="/images/loginBg.jpg" alt="Login" className="w-full h-full" />
      </div>

      <div className="bg-[#f4f7f9] w-1/2 flex flex-col justify-center p-24 gap-6 min-h-screen ">
        <h1 className="text-4xl mb-4 font-semibold">
          Roster And Shift Management
        </h1>
        <div className="flex justify-start">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            useOneTap
          />
        </div>
        <p>
          Need help? Please contact the{" "}
          <a
            href="mailto:peoplemanagement@lftechnology.com"
            className="text-blue-600"
          >
            People Management Team
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
