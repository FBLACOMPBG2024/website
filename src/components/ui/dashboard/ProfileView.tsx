import Card from "@/components/ui/Card";
import TextInput from "@/components/ui/TextInput";
import { IUser } from "@/components/context/UserContext";

interface ProfileViewProps {
  user: IUser;
}

export default function ProfileView({ user }: ProfileViewProps) {
  return (
    <Card className="h-full w-full">
      <h1 className="text-2xl font-bold text-text">Profile</h1>
      <div className="flex flex-row gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-text">First Name</h2>
          <TextInput
            className="w-fit"
            placeholder="First Name"
            value={user.firstName}
            onChange={(e) => {}}
          />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-text">Last Name</h2>
          <TextInput
            className="w-fit"
            placeholder="Last Name"
            value={user.lastName}
            onChange={(e) => {}}
          />
        </div>
      </div>
      <div className="flex flex-col pt-2">
        <h2 className="text-lg font-bold text-text">Email</h2>
        <TextInput
          className="w-fit"
          placeholder="Email"
          value={user.email}
          onChange={(e) => {}}
        />
      </div>
      <div className="flex flex-row justify-end">
        {/* Save Button (Right Aligned) */}
        <button
          className="text-lg bg-backgroundGrayLight rounded-md shadow-md py-1 px-10"
          onClick={() => {}}
        >
          Save
        </button>
      </div>
    </Card>
  );
}
