import Topbar from "@/components/topbar";
import Card from "@/components/card";
import TextInput from "@/components/text-input";
import { IconBrandGoogleFilled } from "@tabler/icons-react";
import { useState } from "react";
import SignInSchema from "@/schemas/signinSchema";

export default function SignIn() {


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  // Couldn't think of a better name but it is used to check if the user has entered something wrong 
  const [isBad, setIsBad] = useState(false);

  const handleSignIn = async () => {
    const inputData = {
      email,
      password,
    };

    const result = SignInSchema.safeParse(inputData);

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

    const response = await fetch("/api/auth/sign-in", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inputData),
    });

    if (response.ok) {
      setMessage("Sign in successful");
    } else {
      const res = await response.json();
      setMessage(res.message);
      setIsBad(true);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSignIn();
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
            <h1 className="text-4xl font-bold p-2">
              Sign In
            </h1>
            <div className="w-full py-2">
              <TextInput className={`w-full mt-1 mb-2 ${isEmailValid ? '' : 'border-b-red-500'}`} type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKeyDown} />
              <TextInput className={`w-full my-1 ${isPasswordValid ? '' : 'border-b-red-500'}`} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown} />
              <p className={`text-sm ${isBad ? 'text-red-500' : 'text-text'}`}  >
                {message}
              </p>
              <button className="text-lg bg-primary p-2 rounded-md shadow-md w-full my-1" onClick={handleSignIn}>
                Sign In
              </button>
              <p className="text-center text-lg">
                Or
              </p>
              <button className="text-lg bg-backgroundGrayLight p-2 rounded-md shadow-md w-full my-1">
                <div className="flex justify-center items-center ">
                  <IconBrandGoogleFilled className="mr-2" />
                  Sign In with Google
                </div>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div >
  );
}
