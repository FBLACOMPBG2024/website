import Topbar from "@/components/topbar";
import Card from "@/components/card";
import TextInput from "@/components/textinput";
import Button from "@/components/button";
import { IconBrandGoogleFilled } from "@tabler/icons-react";
export default function SignUp() {
  return (
    <div className="flex flex-col h-screen w-screen">
      {/* Topbar */}
      <Topbar />
      {/* Gradient background that fills the remaining screen space */}
      <div className="flex-1 bg-gradient-to-bl from-background via-backgroundGreen to-background justify-center items-center">
        <div className="w-full h-full flex justify-center items-center">
          <Card className="min-w-1/3 max-w-4xl flex-col justify-center items-center m-10">
            <h1 className="text-4xl font-bold p-2">
              Sign Up
            </h1>
            <div className="w-full py-2">
              <TextInput className="w-full my-1" type="text" placeholder="Email" />
              <TextInput className="w-full my-1" type="password" placeholder="Password" />
              <button className="text-lg bg-primary p-2 rounded-md shadow-md w-full my-1">
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
