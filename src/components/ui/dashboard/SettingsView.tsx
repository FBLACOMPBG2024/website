import Card from "@/components/ui/Card";
import Switch from "@/components/ui/Switch";

// This is a sample settings view component
// Not sure yet if we need this, but it's here for now

export default function SettingsView() {
  return (
    <Card className="h-full w-full">
      <h1 className="text-2xl font-bold text-text">Settings</h1>

      <Switch onCheckedChange={() => {}} />
    </Card>
  );
}
