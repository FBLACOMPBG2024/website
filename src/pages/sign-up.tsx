import Topbar from "@/components/ui/Topbar";
import Card from "@/components/ui/Card";
import TextInput from "@/components/ui/TextInput";
import { IconBrandGoogleFilled } from "@tabler/icons-react";
import { useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import SignUpSchema from "@/schemas/signupSchema";
import { useGoogleLogin } from "@react-oauth/google";

export default function SignUp() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isFirstNameValid, setIsFirstNameValid] = useState(true);
  const [isLastNameValid, setIsLastNameValid] = useState(true);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [message, setMessage] = useState("");
  // Couldn't think of a better name but it is used to check if the user has entered something wrong
  const [isBad, setIsBad] = useState(false);

  const handleSignUp = async () => {
    const inputData = {
      firstName,
      lastName,
      email,
      password,
    };

    const result = SignUpSchema.safeParse(inputData);

    if (!result.success) {
      const error = result.error.errors[0];
      setIsBad(true);
      setMessage(error.message);

      if (error.path.includes("firstName")) {
        setIsFirstNameValid(false);
      }
      if (error.path.includes("lastName")) {
        setIsLastNameValid(false);
      }
      if (error.path.includes("email")) {
        setIsEmailValid(false);
      }
      if (error.path.includes("password")) {
        setIsPasswordValid(false);
      }
      return;
    }

    setIsFirstNameValid(true);
    setIsLastNameValid(true);
    setIsEmailValid(true);
    setIsPasswordValid(true);
    setIsBad(false);
    setMessage("");

    const response = await api
      .post("/api/auth/sign-up", {
        email,
        firstName,
        lastName,
        password,
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message || "Failed to sign up";
        setMessage(errorMessage);
        setIsBad(true);
        return;
      });

    if (response?.status === 200) {
      router.push("/email/awaiting-verification?email=" + email);
    }
  };

  const handleGoogleSignUp = useGoogleLogin({
    onSuccess: async ({ code }) => {
      const tokens = await api.post("/api/auth/google", {
        code,
      });

      if (!tokens.data.access_token) {
        setMessage("Failed to get access token");
        setIsBad(true);
        return;
      }

      const response = await api
        .post("/api/auth/google/sign-up", {
          access_token: tokens.data.access_token,
        })
        .catch((error) => {
          const errorMessage =
            error.response?.data?.message || "Failed to get data";
          setMessage(errorMessage);
          setIsBad(true);
          return;
        });

      if (response?.status === 200) {
        router.push(
          "/email/awaiting-verification?email=" + response.data.email
        );
      }
    },
    flow: "auth-code",
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSignUp();
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen">
      {/* Topbar */}
      <Topbar />
      {/* Gradient background that fills the remaining screen space */}
      <div className="flex-1 bg-gradient-to-bl from-background via-backgroundGreen to-background justify-center items-center">
        <div className="w-full h-full flex justify-center items-center">
          <Card className="min-w-96 w-1/4 flex-col justify-center items-center m-10">
            <h1 className="text-4xl font-bold p-2">Sign Up</h1>
            <div className="w-full py-2">
              <div className="flex flex-row space-x-2">
                <TextInput
                  className={`w-full my-1 ${!isFirstNameValid ? "border-b-red-500" : ""}`}
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => {
                    setMessage("");
                    setIsBad(false);
                    setIsFirstNameValid(true);
                    setFirstName(e.target.value);
                  }}
                  onKeyDown={handleKeyDown}
                />
                <TextInput
                  className={`w-full my-1 ${!isLastNameValid ? "border-b-red-500" : ""}`}
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => {
                    setMessage("");
                    setIsBad(false);
                    setIsLastNameValid(true);
                    setLastName(e.target.value);
                  }}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <TextInput
                className={`w-full mt-1 mb-2 ${!isEmailValid ? "border-b-red-500" : ""}`}
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setMessage("");
                  setIsBad(false);
                  setIsEmailValid(true);
                  setEmail(e.target.value);
                }}
                onKeyDown={handleKeyDown}
              />
              <TextInput
                className={`w-full my-1 ${!isPasswordValid ? "border-b-red-500" : ""}`}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setMessage("");
                  setIsBad(false);
                  setIsPasswordValid(true);
                  setPassword(e.target.value);
                }}
                onKeyDown={handleKeyDown}
              />
              <p className={`text-sm ${isBad ? "text-red-500" : "text-text"}`}>
                {message}
              </p>
              <button
                className="transition-all duration-300 hover:bg-primary/80 bg-primary text-lg p-2 rounded-md shadow-md w-full my-1"
                onClick={handleSignUp}
              >
                Sign Up
              </button>
              <p className="text-center text-lg">Or</p>
              <button
                onClick={handleGoogleSignUp}
                className="text-lg bg-backgroundGrayLight p-2 rounded-md shadow-md w-full my-1"
              >
                <div className="flex justify-center items-center ">
                  <IconBrandGoogleFilled className="mr-2" />
                  Sign Up with Google
                </div>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
