import Topbar from "@/components/topbar";
import Card from "@/components/card";
import TextInput from "@/components/text-input";
import { IconBrandGoogleFilled } from "@tabler/icons-react";
import { useState } from "react";
import SignupSchema from "@/schemas/signupSchema";

export default function SignUp() {
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

    const result = SignupSchema.safeParse(inputData);

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


    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        firstName,
        lastName,
        password,
      })
    });
    const data = await response.json();
    console.log(data);

    if (response.ok) {
      setMessage("Sign up successful");
    } else {
      setMessage(data.message);
      setIsBad(true);
    }

  };

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
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
            <h1 className="text-4xl font-bold p-2">
              Sign Up
            </h1>
            <div className="w-full py-2">
              <div className="flex flex-row space-x-2">
                <TextInput
                  className={`w-full my-1 ${!isFirstNameValid ? 'border-b-red-500' : ''}`}
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={
                    (e) => {
                      setMessage("");
                      setIsBad(false);
                      setIsFirstNameValid(true);
                      setFirstName(e.target.value)
                    }
                  }
                  onKeyDown={handleKeyDown}
                />
                <TextInput
                  className={`w-full my-1 ${!isLastNameValid ? 'border-b-red-500' : ''}`}
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={
                    (e) => {
                      setMessage("");
                      setIsBad(false);
                      setIsLastNameValid(true);
                      setLastName(e.target.value)
                    }
                  }
                  onKeyDown={handleKeyDown}
                />
              </div>
              <TextInput
                className={`w-full mt-1 mb-2 ${!isEmailValid ? 'border-b-red-500' : ''}`}
                type="text"
                placeholder="Email"
                value={email}
                onChange={
                  (e) => {
                    setMessage("");
                    setIsBad(false);
                    setIsEmailValid(true);
                    setEmail(e.target.value)
                  }
                }
                onKeyDown={handleKeyDown}
              />
              <TextInput
                className={`w-full my-1 ${!isPasswordValid ? 'border-b-red-500' : ''}`}
                type="password"
                placeholder="Password"
                value={password}
                onChange={
                  (e) => {
                    setMessage("");
                    setIsBad(false);
                    setIsPasswordValid(true);
                    setPassword(e.target.value)
                  }
                }
                onKeyDown={handleKeyDown}
              />
              <p className={`text-sm ${isBad ? 'text-red-500' : 'text-text'}`}  >
                {message}
              </p>
              <button
                className="transition-colors duration-500 hover:bg-primary/80 text-lg bg-primary p-2 rounded-md shadow-md w-full my-1"
                onClick={handleSignUp}
              >
                Sign Up
              </button>
              <p className="text-center text-lg">
                Or
              </p>
              <button className="text-lg bg-backgroundGrayLight p-2 rounded-md shadow-md w-full my-1">
                <div className="flex justify-center items-center ">
                  <IconBrandGoogleFilled className="mr-2" />
                  Sign Up with Google
                </div>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div >
  );
}
