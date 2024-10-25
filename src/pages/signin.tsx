import Topbar from "@/components/topbar";
import Card from "@/components/card";
import TextInput from "@/components/text-input";
import { IconBrandGoogleFilled } from "@tabler/icons-react";
import { useSession, signIn, signOut } from "next-auth/react"

export default function SignIn() {
  const { data: session } = useSession();

  if (session) {
    return <div>Signed in as {session.user?.email}</div>
  }

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
              <TextInput className="w-full mt-1 mb-2" type="text" placeholder="Email" />
              <TextInput className="w-full my-1" type="password" placeholder="Password" />
              <button className="text-lg bg-primary p-2 rounded-md shadow-md w-full my-1">
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
