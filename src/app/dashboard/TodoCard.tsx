import React, { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
    ContextMenu,
    ContextMenuTrigger,
    ContextMenuContent,
    ContextMenuItem,
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
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

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
    onStatusChange?: (checked: boolean) => void;
    onTitleChange?: (newTitle: string) => void;
    onDescriptionChange?: (newDescription: string) => void;
    task_date?: string;
    task_only_time?: string;
    onDateChange?: (newDate: string) => void;
    onTimeChange?: (newTime: string) => void;
    onPriorityChange?: (newPriority: string) => void;
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
    return (
        <div
            className={`flex gap-3 cursor-pointer p-3 bg-card text-card-foreground transition-all border-l-4 border-transparent hover:border-primary/20 mb-1 rounded-md ${
                status ? "opacity-50" : "opacity-100"
            }`}
        >
            <div className="flex pt-1.5" onClick={(e) => e.stopPropagation()}>
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
                                    className={`font-medium text-lg w-full resize-none bg-transparent p-0 pr-20 h-auto mb-2 transition-colors min-h-0 border-none focus:outline-none focus:ring-0 text-card-foreground ${
                                        status
                                            ? "line-through text-muted-foreground"
                                            : ""
                                    }`}
                                    value={titleValue}
                                    onChange={(e) => {
                                        setTitleValue(e.target.value);
                                        if (inputRef.current) {
                                            inputRef.current.style.height =
                                                "auto";
                                            inputRef.current.style.height =
                                                inputRef.current.scrollHeight +
                                                "px";
                                        }
                                    }}
                                    onBlur={(e) => {
                                        setIsTitleFocused(false);
                                        handleTitleBlur();
                                    }}
                                    onFocus={() => setIsTitleFocused(true)}
                                    onKeyDown={handleTitleKeyDown}
                                    style={{
                                        width: "100%",
                                        overflow: "hidden",
                                        fontSize: "1.125rem",
                                        lineHeight: "1.5",
                                        minHeight: 0,
                                    }}
                                    spellCheck={false}
                                    rows={1}
                                />
                                <span
                                    className={`block text-sm space-x-2 ${timeColor}`}
                                >
                                    <Popover
                                        open={showDatePicker}
                                        onOpenChange={setShowDatePicker}
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
                                                        ? (() => {
                                                              const [
                                                                  year,
                                                                  month,
                                                                  day,
                                                              ] =
                                                                  task_date.split(
                                                                      "-"
                                                                  );
                                                              return new Date(
                                                                  Number(year),
                                                                  Number(
                                                                      month
                                                                  ) - 1,
                                                                  Number(day)
                                                              );
                                                          })()
                                                        : undefined
                                                }
                                                onSelect={(date) => {
                                                    setShowDatePicker(false);
                                                    if (date && onDateChange) {
                                                        const year =
                                                            date.getFullYear();
                                                        const month = String(
                                                            date.getMonth() + 1
                                                        ).padStart(2, "0");
                                                        const day = String(
                                                            date.getDate()
                                                        ).padStart(2, "0");
                                                        onDateChange(
                                                            `${year}-${month}-${day}`
                                                        );
                                                    }
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {!editingTime ? (
                                        <span
                                            className="cursor-pointer underline decoration-dotted hover:text-primary transition-colors"
                                            onClick={() => setEditingTime(true)}
                                        >
                                            {format12HourTime(displayTime)}
                                        </span>
                                    ) : (
                                        <Input
                                            type="text"
                                            className="w-28 inline-block ml-2 bg-background "
                                            value={timeInputValue}
                                            placeholder="hh:mm AM/PM"
                                            onChange={(e) =>
                                                setTimeInputValue(
                                                    e.target.value
                                                )
                                            }
                                            onBlur={() => {
                                                setEditingTime(false);
                                                const parsed =
                                                    parse12HourInput(
                                                        timeInputValue
                                                    );
                                                if (parsed && onTimeChange) {
                                                    onTimeChange(parsed);
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    setEditingTime(false);
                                                    const parsed =
                                                        parse12HourInput(
                                                            timeInputValue
                                                        );
                                                    if (
                                                        parsed &&
                                                        onTimeChange
                                                    ) {
                                                        onTimeChange(parsed);
                                                    }
                                                }
                                            }}
                                            autoFocus
                                        />
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                    <Textarea
                        ref={descriptionRef}
                        className="text-sm text-muted-foreground mt-1 w-full resize-none bg-transparent p-0 border-none focus:outline-none focus:ring-0"
                        value={descriptionValue}
                        onChange={(e) => {
                            setDescriptionValue(e.target.value);
                            if (descriptionRef.current) {
                                descriptionRef.current.style.height = "auto";
                                descriptionRef.current.style.height =
                                    descriptionRef.current.scrollHeight + "px";
                            }
                        }}
                        onBlur={handleDescriptionBlur}
                        onFocus={() => setIsDescriptionFocused(true)}
                        onKeyDown={handleDescriptionKeyDown}
                        style={{
                            width: "100%",
                            overflow: "hidden",
                            minHeight: 0,
                        }}
                        spellCheck={false}
                        rows={1}
                    />
                    <div className="flex gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Badge
                                    className="mt-2 rounded-small cursor-pointer font-mono"
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
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuRadioGroup
                                    value={priority || "None"}
                                    onValueChange={(value) => {
                                        if (onPriorityChange)
                                            onPriorityChange(
                                                value === "None" ? "" : value
                                            );
                                    }}
                                >
                                    <DropdownMenuRadioItem
                                        value="High"
                                        className="text-red-500 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-500"
                                    >
                                        High
                                    </DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem
                                        value="Medium"
                                        className="text-yellow-700 hover:bg-yellow-500/10 focus:bg-yellow-500/10 focus:text-yellow-700"
                                    >
                                        Medium
                                    </DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem
                                        value="Low"
                                        className="text-green-700 hover:bg-green-500/10 focus:bg-green-500/10 focus:text-green-700"
                                    >
                                        Low
                                    </DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="None">
                                        None
                                    </DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Badge
                            className="mt-2 rounded-full font-mono"
                            variant="outline"
                        >
                            {category || "No Category"}
                        </Badge>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TodoCard;
