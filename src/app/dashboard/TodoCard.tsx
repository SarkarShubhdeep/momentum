import React from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    ContextMenu,
    ContextMenuTrigger,
    ContextMenuContent,
    ContextMenuItem,
} from "@/components/ui/context-menu";

interface TodoCardProps {
    title: string;
    description: string;
    priority: "High" | "Medium" | "Low";
    time: string;
    id: string;
}

const TodoCard: React.FC<TodoCardProps> = ({
    title,
    description,
    priority,
    time,
    id,
}) => {
    return (
        <ContextMenu>
            <ContextMenuTrigger>
                <div className="p-4 bg-white transition-border border-l-4 border-transparent hover:border-blue-200 mb-1">
                    <div className="flex gap-3">
                        <div className="flex pt-1">
                            <Checkbox
                                id={id}
                                className="border-gray-300 shadow-none"
                            />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className="font-medium">{title}</h3>
                                <span className="text-sm text-gray-500">
                                    {time}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                {description}
                            </p>
                            <div className="flex gap-2">
                                <Badge
                                    className="mt-2"
                                    variant={
                                        priority === "High"
                                            ? "destructive"
                                            : priority === "Medium"
                                            ? "secondary"
                                            : "default"
                                    }
                                >
                                    {priority}
                                </Badge>
                                <Badge
                                    className="mt-2 rounded-full"
                                    variant="outline"
                                >
                                    Category
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem>Edit</ContextMenuItem>
                <ContextMenuItem>Delete</ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
};

export default TodoCard;
