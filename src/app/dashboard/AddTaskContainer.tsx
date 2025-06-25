import { useState, useRef } from "react";
import AddTaskButton from "./AddTaskButton";
import AddTaskBar, { AddTaskBarRef } from "./AddTaskBar";
import { Category } from "@/types/category";

interface AddTaskContainerProps {
    onAddTask?: (task: any) => void;
    onFilter?: () => void;
    onSort?: () => void;
    categories?: Category[];
    userId: string;
    onCategoriesUpdate: (categories: Category[]) => void;
}

export default function AddTaskContainer({
    onAddTask,
    onFilter,
    onSort,
    categories = [],
    userId,
    onCategoriesUpdate,
}: AddTaskContainerProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [taskTitle, setTaskTitle] = useState("");
    const addTaskBarRef = useRef<AddTaskBarRef>(null);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    const handleTaskTitleChange = (title: string) => {
        setTaskTitle(title);
    };

    const handleAddTask = (newTask: any) => {
        // Reset the form state
        setTaskTitle("");
        setIsExpanded(false);
        // Pass the new task to parent component
        onAddTask?.(newTask);
    };

    const handleAddTaskClick = async () => {
        if (addTaskBarRef.current) {
            await addTaskBarRef.current.handleAddTask();
        }
    };

    return (
        <div className="absolute bottom-0 right-0 w-full">
            {isExpanded && (
                <AddTaskBar
                    ref={addTaskBarRef}
                    onAddTask={handleAddTask}
                    onFilter={onFilter}
                    onSort={onSort}
                    categories={categories}
                    onTaskTitleChange={handleTaskTitleChange}
                    userId={userId}
                    onCategoriesUpdate={onCategoriesUpdate}
                />
            )}
            <AddTaskButton
                onClick={toggleExpanded}
                isExpanded={isExpanded}
                hasTaskTitle={taskTitle.trim().length > 0}
                onAddTask={handleAddTaskClick}
            />
        </div>
    );
}
