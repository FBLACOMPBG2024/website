import { IUser } from "@/components/context/UserContext";
import TextInput from "@/components/ui/TextInput";
import Card from "@/components/ui/Card";
import { useState } from "react";
import { useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import Router from "next/router";
import { Goal } from "@/schemas/goalSchema";
import {
  fetchGoals,
  deleteGoal,
  editGoal,
  createGoal,
} from "@/utils/apiHelpers";

interface GoalViewProps {
  user: IUser;
}

export default function GoalView({ user }: GoalViewProps) {
  const [goals, setGoals] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [goalValue, setGoalValue] = useState(0);
  const [goalTargetDate, setGoalTargetDate] = useState("");
  const [isEditGoal, setIsEditGoal] = useState<any>(false);

  useEffect(() => {
    fetchGoals().then((data) => {
      setGoals(data.goals);
    });
  }, []);

  return (
    <Card className="h-full w-full">
      <h1 className="text-4xl font-black text-text">Goals</h1>

      <button
        className="sm:max-h-10 max-h-10 transition-all duration-200 hover:opacity-80 sm:text-lg text-sm px-2 py-1 bg-primary text-white rounded flex items-center"
        onClick={() => setIsModalOpen(true)}
      >
        <IconPlus className="mr-1" />
        <p className="hidden sm:block">Create Goal</p>
      </button>

      <div className="flex flex-col gap-4">
        {(goals.length === 0 && (
          <p className="text-text">You have no goals yet.</p>
        )) ||
          goals.map((goal) => (
            <div
              key={goal._id}
              className="group font-bold flex flex-col gap-2 bg-neutral-900 p-4 rounded-lg mt-4"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-text">{goal.name}</h2>
                <div>
                  <button
                    className="group-hover:opacity-100 opacity-0 transition-all duration-200"
                    onClick={() => {
                      setIsEditGoal(goal);
                      setGoalName(goal.name);
                      setGoalDescription(goal.description);
                      setGoalValue(goal.value);
                      setGoalTargetDate(goal.targetDate);
                      setIsModalOpen(true);
                    }}
                  >
                    <IconEdit className="text-text " />
                  </button>
                  <button
                    className="group-hover:opacity-100 opacity-0 transition-all duration-200"
                    onClick={() => {
                      deleteGoal(goal._id);
                    }}
                  >
                    <IconTrash className="text-text " />
                  </button>
                </div>
              </div>
              <p className="text-md font-normal text-neutral-500">
                {goal.description}
              </p>
              <p className="text-text text-xl font-semibold">
                Progress: {user.balance.toFixed(2)}/{goal.value}
              </p>
              <div className="h-2 bg-background rounded-full">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{
                    width: `${Math.min((user.balance / goal.value) * 100, 100)}%`,
                  }}
                ></div>
              </div>
              <p className="text-text text-sm font-normal">
                Target Date: {new Date(goal.targetDate).toLocaleDateString()}
              </p>
            </div>
          ))}
      </div>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const goal: Goal = {
              _id: isEditGoal?._id,
              name: goalName,
              description: goalDescription,
              value: goalValue,
              targetDate: new Date(goalTargetDate).toString() || undefined,
            };

            if (isEditGoal) {
              await editGoal(goal);
            } else {
              await createGoal(goal);
            }

            setIsModalOpen(false);

            const updatedGoals = await fetchGoals();
            setGoals(updatedGoals.goals);

            // Reset form fields
            setGoalName("");
            setGoalDescription("");
            setGoalValue(0);
            setGoalTargetDate("");
            setIsEditGoal(false);
          }}
        >
          <h1 className="text-2xl font-bold text-text">
            {isEditGoal ? "Edit Goal" : "Create Goal"}
          </h1>
          <div>
            <div>
              <label>
                Name:
                <TextInput
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  required
                />
              </label>
            </div>
            <div>
              <label>
                Description:
                <TextInput
                  type="text"
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                />
              </label>
            </div>
            <div>
              <label>
                Value:
                <TextInput
                  type="number"
                  value={goalValue.toString()}
                  onChange={(e) => setGoalValue(parseInt(e.target.value))}
                  required
                />
              </label>
              <div>
                <label>
                  Target Date:
                  <TextInput
                    type="date"
                    value={goalTargetDate}
                    onChange={(e) => setGoalTargetDate(e.target.value)}
                    required
                  />
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="bg-primary text-white rounded px-2 py-1"
          >
            {isEditGoal ? "Edit Goal" : "Create Goal"}
          </button>
        </form>
      </Modal>
    </Card>
  );
}
