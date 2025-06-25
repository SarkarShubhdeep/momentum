import { Button } from "@/components/ui/button";
import Image from "next/image";

interface AddTaskButtonProps {
    onClick: () => void;
    isExpanded?: boolean;
    hasTaskTitle?: boolean;
    onAddTask?: () => void;
}

export default function AddTaskButton({
    onClick,
    isExpanded = false,
    hasTaskTitle = false,
    onAddTask,
}: AddTaskButtonProps) {
    const getIconRotationClass = () => {
        if (isExpanded && !hasTaskTitle) {
            return "rotate-45"; // 45° rotation when expanded and no title
        }
        return "rotate-0"; // Original rotation
    };

    const handleClick = () => {
        if (isExpanded && hasTaskTitle) {
            // If expanded and has title, add the task
            onAddTask?.();
        } else {
            // Otherwise toggle the form
            onClick();
        }
    };

    return (
        <Button
            variant="ghost"
            onClick={handleClick}
            className={`absolute bottom-0 right-0 z-30 text-sm h-[80px] w-[80px] rounded-xl hover:rounded-2xl hover:bg-blue-600 group bg-neutral-800 ${
                isExpanded ? "scale-100" : "scale-80"
            } hover:scale-100 transition-all duration-150`}
        >
            <Image
                src="/icons/add-dark.svg"
                alt="add"
                width={28}
                height={28}
                className={`transition-transform duration-150 ${getIconRotationClass()}`}
            />
        </Button>
    );
}
