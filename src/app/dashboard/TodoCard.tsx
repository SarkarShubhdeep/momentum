import React, { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
    ContextMenu,
    ContextMenuTrigger,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
} from "@/components/ui/context-menu";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
    Menubar,
    MenubarMenu,
    MenubarTrigger,
    MenubarContent,
    MenubarRadioGroup,
    MenubarRadioItem,
} from "@/components/ui/menubar";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
    MoreHorizontal,
    Edit,
    Trash2,
    Copy,
    Archive,
    Flag,
    FolderOpen,
    AlertTriangle,
} from "lucide-react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function formatTaskTime(timeStr: string) {
    if (!timeStr) return "";
    const date = new Date(timeStr);
    const now = new Date();
    const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear();
    const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];
    const isThisWeek = (() => {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        return date >= startOfWeek && date <= endOfWeek;
    })();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const hours = date.getHours();
    const minutes = pad(date.getMinutes());
    const ampm = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;
    const timeStr12 = `${hour12}:${minutes} ${ampm}`;
    if (isToday) return `Today ${timeStr12}`;
    if (isYesterday) return `Yesterday ${timeStr12}`;
    if (isThisWeek) return `${daysOfWeek[date.getDay()]} ${timeStr12}`;
    return `${date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    })} ${timeStr12}`;
}

// Helper to format time in 12-hour format
function format12HourTime(time24: string) {
    if (!time24) return "";
    const [h, m] = time24.split(":");
    let hour = parseInt(h, 10);
    const minute = m.padStart(2, "0");
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minute} ${ampm}`;
}

// Helper to parse 12-hour input to 24-hour format
function parse12HourInput(input: string): string | null {
    const match = input.trim().match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/);
    if (!match) return null;
    let [_, hour, minute, ampm] = match;
    let h = parseInt(hour, 10);
    if (ampm.toLowerCase() === "pm" && h !== 12) h += 12;
    if (ampm.toLowerCase() === "am" && h === 12) h = 0;
    return `${h.toString().padStart(2, "0")}:${minute}:00`;
}

interface TodoCardProps {
    title: string;
    description: string;
    priority?: "High" | "Medium" | "Low" | "None";
    time: string;
    id: string;
    category?: string;
    status?: boolean;
    categories?: Array<{ cat_id: string; cat_name: string }>;
    onStatusChange?: (checked: boolean) => void;
    onTitleChange?: (newTitle: string) => void;
    onDescriptionChange?: (newDescription: string) => void;
    task_date?: string;
    task_only_time?: string;
    onDateChange?: (newDate: string) => void;
    onTimeChange?: (newTime: string) => void;
    onPriorityChange?: (newPriority: string) => void;
    onCategoryChange?: (newCategory: string) => void;
    onDuplicate?: (taskId: string) => void;
    onArchive?: (taskId: string) => void;
    onDelete?: (taskId: string) => void;
}

const TodoCard: React.FC<TodoCardProps> = ({
    title,
    description,
    priority,
    time,
    id,
    category,
    status = false,
    onStatusChange,
    onTitleChange,
    onDescriptionChange,
    task_date,
    task_only_time,
    onDateChange,
    onTimeChange,
    onPriorityChange,
    onCategoryChange,
    onDuplicate,
    onArchive,
    onDelete,
    categories,
}) => {
    const [editingTitle, setEditingTitle] = useState(false);
    const [titleValue, setTitleValue] = useState(title);
    const [editingDescription, setEditingDescription] = useState(false);
    const [descriptionValue, setDescriptionValue] = useState(description);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    const [isTitleFocused, setIsTitleFocused] = useState(false);
    const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [editingTime, setEditingTime] = useState(false);
    const [timeInputValue, setTimeInputValue] = useState(
        format12HourTime(task_only_time ? task_only_time.slice(0, 5) : "")
    );
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editTitle, setEditTitle] = useState(title);
    const [editDescription, setEditDescription] = useState(description);
    const [editCategory, setEditCategory] = useState<string | undefined>(
        categories?.find((cat) => cat.cat_name === category)?.cat_id ||
            undefined
    );
    const [editPriority, setEditPriority] = useState(priority || "None");

    // Focus input when editing starts
    React.useEffect(() => {
        if (editingTitle && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editingTitle]);

    // Auto-resize textarea on mount and whenever titleValue changes
    React.useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = "auto";
            inputRef.current.style.height =
                inputRef.current.scrollHeight + "px";
        }
    }, [titleValue]);

    // Auto-resize description textarea
    React.useEffect(() => {
        if (descriptionRef.current) {
            descriptionRef.current.style.height = "auto";
            descriptionRef.current.style.height =
                descriptionRef.current.scrollHeight + "px";
        }
    }, [descriptionValue]);

    React.useEffect(() => {
        setTimeInputValue(
            format12HourTime(task_only_time ? task_only_time.slice(0, 5) : "")
        );
    }, [task_only_time]);

    const handleTitleBlur = () => {
        setEditingTitle(false);
        if (titleValue !== title && onTitleChange) {
            onTitleChange(titleValue);
        }
    };

    const handleTitleKeyDown = (
        e: React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            inputRef.current?.blur();
        }
    };

    const handleDescriptionBlur = () => {
        setEditingDescription(false);
        if (descriptionValue !== description && onDescriptionChange) {
            onDescriptionChange(descriptionValue);
        }
    };

    const handleDescriptionKeyDown = (
        e: React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            descriptionRef.current?.blur();
        }
    };

    // Date and time display logic
    let displayDate = task_date
        ? (() => {
              const [year, month, day] = task_date.split("-");
              return `${month}/${day}/${year}`;
          })()
        : "";
    let displayTime = task_only_time ? task_only_time.slice(0, 5) : "";

    // Color logic: prioritize date, then time if today
    let timeColor = "text-gray-500";
    if (task_date) {
        const [year, month, day] = task_date.split("-").map(Number);
        const today = new Date();
        const dateObj = new Date(year, month - 1, day);
        // Remove time from today for comparison
        today.setHours(0, 0, 0, 0);
        if (dateObj > today) {
            timeColor = "text-blue-600"; // future date
        } else if (dateObj < today) {
            timeColor = "text-red-600"; // past date
        } else {
            // date is today, check time
            if (task_only_time) {
                const [h, m] = task_only_time.split(":").map(Number);
                const now = new Date();
                const taskTime = new Date();
                taskTime.setHours(h, m, 0, 0);
                if (taskTime > now) {
                    timeColor = "text-blue-600";
                } else {
                    timeColor = "text-red-600";
                }
            } else {
                // No time, treat as today and in the past
                timeColor = "text-red-600";
            }
        }
    } else if (time) {
        // Fallback to old logic if no date
        const date = new Date(time);
        const now = new Date();
        timeColor = date > now ? "text-blue-600" : "text-red-600";
    }

    const handleEditSave = () => {
        if (editTitle !== title && onTitleChange) onTitleChange(editTitle);
        if (editDescription !== description && onDescriptionChange)
            onDescriptionChange(editDescription);
        if (
            editCategory !==
                categories?.find((cat) => cat.cat_name === category)?.cat_id &&
            onCategoryChange
        )
            onCategoryChange(editCategory || "");
        if (editPriority !== priority && onPriorityChange)
            onPriorityChange(editPriority);
        setEditDialogOpen(false);
    };

    return (
        <>
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Task</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-3">
                        <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Title"
                        />
                        <Textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="Description"
                        />
                        <div className="flex gap-2">
                            <select
                                className="border rounded px-2 py-1"
                                value={editCategory || ""}
                                onChange={(e) =>
                                    setEditCategory(e.target.value || undefined)
                                }
                            >
                                <option value="">No Category</option>
                                {categories?.map((cat) => (
                                    <option key={cat.cat_id} value={cat.cat_id}>
                                        {cat.cat_name}
                                    </option>
                                ))}
                            </select>
                            <select
                                className="border rounded px-2 py-1"
                                value={editPriority}
                                onChange={(e) =>
                                    setEditPriority(e.target.value as any)
                                }
                            >
                                <option value="None">None</option>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEditDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleEditSave}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <ContextMenu>
                <ContextMenuTrigger>
                    <div
                        className={`flex gap-3  p-3 bg-card text-card-foreground transition-all border-l-4 border-transparent hover:border-primary/20 mb-1 rounded-md ${
                            status ? "opacity-50" : "opacity-100"
                        }`}
                    >
                        <div
                            className="flex pt-1"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Checkbox
                                id={id}
                                className="border-input dark:border-input/50"
                                checked={status}
                                onCheckedChange={onStatusChange}
                            />
                        </div>
                        <div className="flex-1">
                            <div className="">
                                <div className="flex justify-between items-start relative">
                                    <div className="relative w-full">
                                        <div className="">
                                            <Textarea
                                                ref={inputRef}
                                                className="w-full resize-none bg-transparent p-0 border-none focus:outline-none focus:ring-0"
                                                value={titleValue}
                                                onChange={(e) => {
                                                    setTitleValue(
                                                        e.target.value
                                                    );
                                                    if (inputRef.current) {
                                                        inputRef.current.style.height =
                                                            "auto";
                                                        inputRef.current.style.height =
                                                            inputRef.current
                                                                .scrollHeight +
                                                            "px";
                                                    }
                                                }}
                                                onBlur={handleTitleBlur}
                                                onFocus={() =>
                                                    setIsTitleFocused(true)
                                                }
                                                onKeyDown={handleTitleKeyDown}
                                                style={{
                                                    width: "100%",
                                                    overflow: "hidden",
                                                    minHeight: 0,
                                                    fontSize: "1rem",
                                                }}
                                                spellCheck={false}
                                                rows={1}
                                            />
                                            {(task_date || task_only_time) && (
                                                <span
                                                    className={`block text-sm space-x-2 ${timeColor}`}
                                                >
                                                    <Popover
                                                        open={showDatePicker}
                                                        onOpenChange={
                                                            setShowDatePicker
                                                        }
                                                    >
                                                        <PopoverTrigger asChild>
                                                            <span className="cursor-pointer underline decoration-dotted hover:text-primary transition-colors">
                                                                {displayDate}
                                                            </span>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-fit p-0 bg-card text-card-foreground border border-border shadow-lg rounded-md">
                                                            <Calendar
                                                                mode="single"
                                                                selected={
                                                                    task_date
                                                                        ? new Date(
                                                                              task_date +
                                                                                  "T00:00:00"
                                                                          )
                                                                        : undefined
                                                                }
                                                                onSelect={(
                                                                    date
                                                                ) => {
                                                                    if (
                                                                        date &&
                                                                        onDateChange
                                                                    ) {
                                                                        onDateChange(
                                                                            date
                                                                                .toISOString()
                                                                                .split(
                                                                                    "T"
                                                                                )[0]
                                                                        );
                                                                    }
                                                                    setShowDatePicker(
                                                                        false
                                                                    );
                                                                }}
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    {!editingTime ? (
                                                        <span
                                                            className="cursor-pointer underline decoration-dotted hover:text-primary transition-colors"
                                                            onClick={() =>
                                                                setEditingTime(
                                                                    true
                                                                )
                                                            }
                                                        >
                                                            {format12HourTime(
                                                                displayTime
                                                            )}
                                                        </span>
                                                    ) : (
                                                        <Input
                                                            type="text"
                                                            className="w-28 inline-block ml-2 bg-background "
                                                            value={
                                                                timeInputValue
                                                            }
                                                            placeholder="hh:mm AM/PM"
                                                            onChange={(e) =>
                                                                setTimeInputValue(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            onBlur={() => {
                                                                setEditingTime(
                                                                    false
                                                                );
                                                                const parsed =
                                                                    parse12HourInput(
                                                                        timeInputValue
                                                                    );
                                                                if (
                                                                    parsed &&
                                                                    onTimeChange
                                                                ) {
                                                                    onTimeChange(
                                                                        parsed
                                                                    );
                                                                }
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (
                                                                    e.key ===
                                                                    "Enter"
                                                                ) {
                                                                    setEditingTime(
                                                                        false
                                                                    );
                                                                    const parsed =
                                                                        parse12HourInput(
                                                                            timeInputValue
                                                                        );
                                                                    if (
                                                                        parsed &&
                                                                        onTimeChange
                                                                    ) {
                                                                        onTimeChange(
                                                                            parsed
                                                                        );
                                                                    }
                                                                }
                                                            }}
                                                            autoFocus
                                                        />
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {description && (
                                    <Textarea
                                        ref={descriptionRef}
                                        className="text-sm text-muted-foreground mt-1 w-full resize-none bg-transparent p-0 border-none focus:outline-none focus:ring-0"
                                        value={descriptionValue}
                                        onChange={(e) => {
                                            setDescriptionValue(e.target.value);
                                            if (descriptionRef.current) {
                                                descriptionRef.current.style.height =
                                                    "auto";
                                                descriptionRef.current.style.height =
                                                    descriptionRef.current
                                                        .scrollHeight + "px";
                                            }
                                        }}
                                        onBlur={handleDescriptionBlur}
                                        onFocus={() =>
                                            setIsDescriptionFocused(true)
                                        }
                                        onKeyDown={handleDescriptionKeyDown}
                                        style={{
                                            width: "100%",
                                            overflow: "hidden",
                                            minHeight: 0,
                                        }}
                                        spellCheck={false}
                                        rows={1}
                                    />
                                )}
                                <div className="flex gap-2">
                                    {priority && priority !== "None" && (
                                        <Badge
                                            className="mt-2 rounded-small font-mono"
                                            variant={
                                                priority === "High"
                                                    ? "high"
                                                    : priority === "Medium"
                                                    ? "medium"
                                                    : priority === "Low"
                                                    ? "low"
                                                    : "none"
                                            }
                                        >
                                            {priority || "None"}
                                        </Badge>
                                    )}
                                    {category && category !== "No Category" && (
                                        <Badge
                                            className="mt-2 rounded-full font-mono"
                                            variant="outline"
                                        >
                                            {category || "No Category"}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-48 backdrop-blur-lg bg-neutral-900/10 border border-neutral-300 ">
                    <ContextMenuItem
                        className="flex items-center gap-2 "
                        onClick={() => setEditDialogOpen(true)}
                    >
                        <Edit className="h-4 w-4" />
                        Edit Task
                    </ContextMenuItem>
                    <ContextMenuItem
                        className="flex items-center gap-2"
                        onClick={() => onDuplicate?.(id)}
                    >
                        <Copy className="h-4 w-4" />
                        Duplicate Task
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <ContextMenuItem className="flex items-center gap-2">
                                <FolderOpen className="h-4 w-4" />
                                Category
                            </ContextMenuItem>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right" align="start">
                            <DropdownMenuItem
                                onClick={() => onCategoryChange?.("")}
                                className={
                                    !category || category === "No Category"
                                        ? "bg-blue-100 text-blue-600"
                                        : ""
                                }
                            >
                                No Category
                            </DropdownMenuItem>
                            {categories?.map((cat) => (
                                <DropdownMenuItem
                                    key={cat.cat_id}
                                    onClick={() =>
                                        onCategoryChange?.(cat.cat_id)
                                    }
                                    className={
                                        category === cat.cat_name
                                            ? "bg-blue-100 text-blue-600"
                                            : ""
                                    }
                                >
                                    {cat.cat_name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <ContextMenuItem className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                Set Priority
                            </ContextMenuItem>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right" align="start">
                            <DropdownMenuItem
                                onClick={() => onPriorityChange?.("None")}
                                className={
                                    !priority || priority === "None"
                                        ? "bg-blue-100 text-blue-600"
                                        : ""
                                }
                            >
                                None
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onPriorityChange?.("Low")}
                                className={
                                    priority === "Low"
                                        ? "bg-blue-100 text-blue-600"
                                        : ""
                                }
                            >
                                Low
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onPriorityChange?.("Medium")}
                                className={
                                    priority === "Medium"
                                        ? "bg-blue-100 text-blue-600"
                                        : ""
                                }
                            >
                                Medium
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onPriorityChange?.("High")}
                                className={
                                    priority === "High"
                                        ? "bg-blue-100 text-blue-600"
                                        : ""
                                }
                            >
                                High
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                        className="flex items-center gap-2"
                        onClick={() => onArchive?.(id)}
                    >
                        <Archive className="h-4 w-4" />
                        Archive Task
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                        className="flex items-center gap-2 text-red-600 focus:text-red-600 focus:bg-red-600/10"
                        onClick={() => onDelete?.(id)}
                    >
                        <Trash2 className="h-4 w-4 text-red-600" />
                        Delete Task
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
        </>
    );
};

export default TodoCard;
