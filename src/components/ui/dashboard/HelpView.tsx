import { IUser } from "@/components/context/UserContext";
import TextInput from "@/components/ui/TextInput";
import Card from "@/components/ui/Card";
import { useState } from "react";
import api from "@/utils/api";
import { useTellerConnect } from "teller-connect-react";
import { useEffect } from "react";

interface HelpViewProps {
  user: IUser;
}

export default function HelpView({ user }: HelpViewProps) {
  return (
    <Card className="h-full w-full">
      <h1 className="text-4xl font-black text-text">Help</h1>
      {/* Firstly establish headers with a collapsable div */}

      <div className="flex flex-col">
        <div className="flex flex-row gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-text">Contact Us</h2>
            <p className="text-text">
              If you have any questions, please contact us at{" "}
              <a href="mailto:help@smartspend.irish">Our support email</a>
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-text">FAQ</h2>
            <p className="text-text">
              Check out our FAQ page for more information
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
