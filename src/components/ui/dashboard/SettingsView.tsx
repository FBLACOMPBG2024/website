import Card from "@/components/ui/Card";
import Switch from "@/components/ui/Switch";

export default function SettingsView() {
    return (
        <Card className="h-full w-full" >
            <h1 className="text-2xl font-bold text-text">Settings</h1>

            <Switch
                onCheckedChange={() => { }}
            />
        </Card>
    );
}
