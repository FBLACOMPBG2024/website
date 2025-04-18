import Topbar from "@/components/ui/Topbar";
import Card from "@/components/ui/Card";
import TextInput from "@/components/ui/TextInput";
import { IconBrandGoogleFilled } from "@tabler/icons-react";
import { useState } from "react";
import LoginSchema from "@/schemas/loginSchema";
import api from "@/utils/api";
import { useUser } from "@/components/context/UserContext";
import { useRouter } from "next/router";
import { useGoogleLogin } from "@react-oauth/google";

export default function Login() {
  const router = useRouter();
  const { setUser } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [isBad, setIsBad] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async ({ code }) => {
      const tokens = await api.post("/api/auth/google", {
        code,
      });

      const response = await api
        .post("/api/auth/google/login", {
          access_token: tokens.data.access_token,
        })
        .catch((error) => {
          setMessage(error.response.data.message);
          setIsBad(true);
        });

      if (response?.status === 200) {
        setUser(response.data.user);
        router.push("/dashboard");
      }
    },
    flow: "auth-code",
  });

  const handleLogin = async () => {
    const inputData = {
      email,
      password,
    };

    const result = LoginSchema.safeParse(inputData);

    if (!result.success) {
      const error = result.error.errors[0];
      setIsBad(true);
      setMessage(error.message);
      if (error.path.includes("email")) {
        setIsEmailValid(false);
      }
      if (error.path.includes("password")) {
        setIsPasswordValid(false);
      }
      return;
    }

    const response = await api
      .post("/api/auth/login", {
        email,
        password,
      })
      .catch((error) => {
        if (error.response?.data) {
          setMessage(error.response.data.message);
          setIsBad(true);
        } else {
          setMessage("An error occurred");
          setIsBad(true);
        }
      });

    if (response?.status === 200) {
      setUser(response.data.user);
      router.push("/dashboard");
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setMessage("Email is required");
      setIsBad(true);
      return;
    }

    try {
      const response = await api.post("/api/auth/request-password-reset", {
        email,
      });
      if (response.status === 200) {
        setMessage("Password reset link sent to your email.");
        setIsBad(false);
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || "An error occurred");
      setIsBad(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen">
      {/* Topbar */}
      <Topbar />
      {/* Gradient background that fills the remaining screen space */}
      <div className="flex-1 bg-gradient-to-bl from-background via-backgroundGreen to-background justify-center items-center">
        <div className="w-full h-full flex justify-center items-center">
          <Card className="sm:min-w-96 min-w-3/4 max-w-md w-full mx-6 flex-col justify-center items-center">
            <h1 className="text-4xl font-bold p-2">Login</h1>
            <div className="w-full py-2">
              <TextInput
                className={`w-full mt-1 mb-2 ${isEmailValid ? "" : "border-b-red-500"}`}
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <TextInput
                className={`w-full my-1 ${isPasswordValid ? "" : "border-b-red-500"}`}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <p className={`text-sm ${isBad ? "text-red-500" : "text-text"}`}>
                {message}
              </p>
              <button
                className="text-lg hover:bg-primary/80 bg-primary p-2 rounded-md shadow-md w-full my-1"
                onClick={handleLogin}
              >
                Login
              </button>
              <p className="text-center text-lg">Or</p>
              <button
                onClick={() => login()}
                className="text-lg bg-backgroundGrayLight p-2 rounded-md shadow-md w-full my-1"
              >
                <div className="flex justify-center items-center ">
                  <IconBrandGoogleFilled className="mr-2" />
                  Login with Google
                </div>
              </button>
              <p className="text-sm text-center">
                Forgot your password?{" "}
                <span
                  className="text-primary cursor-pointer"
                  onClick={() => handleResetPassword()}
                >
                  Reset it here
                </span>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
