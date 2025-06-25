import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { useState, forwardRef, useImperativeHandle } from "react";
import { Category } from "@/types/category";
import { ScrollArea } from "@/components/ui/scroll-area";
import { taskService } from "@/services/taskService";
import { toast } from "sonner";
import { categoryService } from "@/services/categoryService";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Clock, X } from "lucide-react";

const PRIORITIES = ["High", "Medium", "Low", "None"];
const PRIORITY_COLORS: Record<string, string> = {
    High: "text-red-900 bg-red-500/40",
    Medium: "text-yellow-900 bg-yellow-500/40",
    Low: "text-green-900 bg-green-500/40",
    None: "text-gray-900 bg-white/50",
};
const PRIORITY_COLORS_HOVER: Record<string, string> = {
    High: "text-red-900 hover:bg-red-500/40",
    Medium: "text-yellow-900 hover:bg-yellow-500/40",
    Low: "text-green-900 hover:bg-green-500/40",
    None: "text-gray-900 hover:bg-white/50",
};

interface AddTaskBarProps {
    onAddTask?: (task: any) => void;
    onFilter?: () => void;
    onSort?: () => void;
    categories?: Category[];
    onTaskTitleChange?: (title: string) => void;
    userId: string;
    onCategoriesUpdate: (categories: Category[]) => void;
}

export interface AddTaskBarRef {
    handleAddTask: () => Promise<void>;
}

const AddTaskBar = forwardRef<AddTaskBarRef, AddTaskBarProps>(
    (
        {
            onAddTask,
            onFilter,
            onSort,
            categories = [],
            onTaskTitleChange,
            userId,
            onCategoriesUpdate,
        },
        ref
    ) => {
        const [selectedCategory, setSelectedCategory] = useState<string | null>(
            null
        );
        const [selectedPriority, setSelectedPriority] =
            useState<string>("None");
        const [taskTitle, setTaskTitle] = useState("");
        const [taskDescription, setTaskDescription] = useState("");
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [categorySearch, setCategorySearch] = useState("");
        const [isCategoryListVisible, setIsCategoryListVisible] =
            useState(false);
        const [isPriorityListVisible, setIsPriorityListVisible] =
            useState(false);
        const [selectedDate, setSelectedDate] = useState<Date | undefined>(
            undefined
        );
        const [selectedTime, setSelectedTime] = useState<string>("");
        const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
        const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
        const [tempTimeSelection, setTempTimeSelection] = useState<{
            hour: string;
            minute: string;
            period: string;
        }>({ hour: "12", minute: "00", period: "AM" });

        // Time picker options - 12 hour format
        const hours = Array.from({ length: 12 }, (_, i) =>
            (i === 0 ? 12 : i).toString().padStart(2, "0")
        );
        const minutes = Array.from({ length: 60 }, (_, i) =>
            i.toString().padStart(2, "0")
        );
        const periods = ["AM", "PM"];

        const handleTaskTitleChange = (
            e: React.ChangeEvent<HTMLInputElement>
        ) => {
            const value = e.target.value;
            setTaskTitle(value);
            onTaskTitleChange?.(value);
        };

        const handleDescriptionChange = (
            e: React.ChangeEvent<HTMLTextAreaElement>
        ) => {
            const value = e.target.value;
            setTaskDescription(value);
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";
        };

        const handleAddTask = async () => {
            if (!taskTitle.trim()) {
                toast.error("Task title is required");
                return;
            }

            if (!userId) {
                toast.error("User not authenticated");
                return;
            }

            setIsSubmitting(true);

            try {
                const taskData = {
                    task_title: taskTitle.trim(),
                    task_desc: taskDescription.trim() || undefined,
                    task_priority: selectedPriority as
                        | "High"
                        | "Medium"
                        | "Low"
                        | "None",
                    cat_id: selectedCategory || undefined,
                    user_id: userId,
                    status: false,
                    task_date: selectedDate
                        ? format(selectedDate, "yyyy-MM-dd")
                        : selectedTime
                        ? format(new Date(), "yyyy-MM-dd")
                        : undefined,
                    task_only_time: selectedTime || undefined,
                };

                const newTask = await taskService.createTask(taskData);

                // Reset form
                setTaskTitle("");
                setTaskDescription("");
                setSelectedCategory(null);
                setSelectedPriority("None");
                setSelectedDate(undefined);
                setSelectedTime("");

                // Notify parent component
                onAddTask?.(newTask);

                toast.success("Task added successfully!");
            } catch (error) {
                console.error("Error creating task:", error);
                toast.error("Failed to add task. Please try again.");
            } finally {
                setIsSubmitting(false);
            }
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAddTask();
            }
        };

        const filteredCategories = categories?.filter((cat) =>
            cat.cat_name.toLowerCase().includes(categorySearch.toLowerCase())
        );

        const handleCategoryKeyDown = async (
            e: React.KeyboardEvent<HTMLInputElement>
        ) => {
            if (e.key === "Enter") {
                e.preventDefault();
                const trimmedSearch = categorySearch.trim();
                if (!trimmedSearch) return;

                const existingCategory = categories?.find(
                    (cat) =>
                        cat.cat_name.toLowerCase() ===
                        trimmedSearch.toLowerCase()
                );

                if (existingCategory) {
                    setSelectedCategory(existingCategory.cat_id);
                    setCategorySearch(existingCategory.cat_name);
                } else {
                    try {
                        const newCategory =
                            await categoryService.createCategory(
                                trimmedSearch,
                                userId
                            );
                        onCategoriesUpdate([
                            ...(categories || []),
                            newCategory,
                        ]);
                        setSelectedCategory(newCategory.cat_id);
                        setCategorySearch(newCategory.cat_name);
                    } catch (error) {
                        toast.error("Failed to create category");
                    }
                }
                setIsCategoryListVisible(false);
            }
        };

        const handleTimeSelect = (hour: string, minute: string) => {
            setSelectedTime(`${hour}:${minute}`);
            setIsTimePickerOpen(false);
        };

        const handleTimeDone = () => {
            // Convert 12-hour to 24-hour format for storage
            let hour24 = parseInt(tempTimeSelection.hour);
            if (tempTimeSelection.period === "PM" && hour24 !== 12) {
                hour24 += 12;
            } else if (tempTimeSelection.period === "AM" && hour24 === 12) {
                hour24 = 0;
            }
            const hour24Str = hour24.toString().padStart(2, "0");
            setSelectedTime(`${hour24Str}:${tempTimeSelection.minute}`);
            setIsTimePickerOpen(false);
        };

        const handleTimePickerOpen = (open: boolean) => {
            setIsTimePickerOpen(open);
            if (open && selectedTime) {
                const [hour24, minute] = selectedTime.split(":");
                const hour24Num = parseInt(hour24);
                let hour12 =
                    hour24Num === 0
                        ? 12
                        : hour24Num > 12
                        ? hour24Num - 12
                        : hour24Num;
                const period = hour24Num >= 12 ? "PM" : "AM";
                setTempTimeSelection({
                    hour: hour12.toString().padStart(2, "0"),
                    minute: minute || "00",
                    period: period,
                });
            } else if (!open) {
                setTempTimeSelection({
                    hour: "12",
                    minute: "00",
                    period: "AM",
                });
            }
        };

        const clearDateTime = () => {
            setSelectedDate(undefined);
            setSelectedTime("");
            setTempTimeSelection({ hour: "12", minute: "00", period: "AM" });
        };

        const formatTimeForDisplay = (time24: string): string => {
            if (!time24) return "";
            const [hour, minute] = time24.split(":");
            const hourNum = parseInt(hour);
            const hour12 =
                hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
            const period = hourNum >= 12 ? "PM" : "AM";
            return `${hour12}:${minute} ${period}`;
        };

        // Expose the handleAddTask function to parent component
        useImperativeHandle(ref, () => ({
            handleAddTask,
        }));

        return (
            <div className="absolute bottom-0 right-0 w-full bg-blue-600/10 backdrop-blur-lg border-neutral-400 z-10 rounded-2xl overflow-hidden">
                <div className="w-full flex flex-col justify-between">
                    {/* Date and Time pickers */}
                    <div className="flex flex-row items-center p-4 gap-2 flex-wrap w-full">
                        <Popover
                            open={isDatePickerOpen}
                            onOpenChange={setIsDatePickerOpen}
                        >
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={`text-xs h-[30px] px-2 rounded-2xl border-none shadow-none ${
                                        selectedDate ||
                                        (selectedTime && !selectedDate)
                                            ? "bg-blue-500/50 text-white"
                                            : "bg-white/50"
                                    }`}
                                >
                                    {selectedDate
                                        ? format(selectedDate, "MMM dd")
                                        : selectedTime && !selectedDate
                                        ? "Today"
                                        : "Date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0"
                                align="start"
                            >
                                <CalendarComponent
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => {
                                        setSelectedDate(date || undefined);
                                        setIsDatePickerOpen(false);
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>

                        <Popover
                            open={isTimePickerOpen}
                            onOpenChange={handleTimePickerOpen}
                        >
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={`text-xs h-[30px] px-2 rounded-2xl border-none shadow-none ${
                                        selectedTime
                                            ? "bg-blue-500/50 text-white"
                                            : "bg-white/50"
                                    }`}
                                >
                                    {selectedTime
                                        ? formatTimeForDisplay(selectedTime)
                                        : "Time"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-3"
                                align="start"
                            >
                                <div className="flex flex-col gap-2">
                                    <div className="text-sm font-medium mb-2">
                                        Select Time
                                    </div>
                                    <div className="text-center mb-2 text-lg font-semibold text-blue-600">
                                        {tempTimeSelection.hour}:
                                        {tempTimeSelection.minute}{" "}
                                        {tempTimeSelection.period}
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex flex-col gap-1">
                                            <div className="text-xs text-gray-500">
                                                Hour
                                            </div>
                                            <ScrollArea className="h-[120px] w-16">
                                                <div className="flex flex-col">
                                                    {hours.map((hour) => (
                                                        <div
                                                            key={hour}
                                                            className={`px-2 py-1 text-center hover:bg-gray-100 cursor-pointer rounded text-sm ${
                                                                tempTimeSelection.hour ===
                                                                hour
                                                                    ? "bg-blue-100 text-blue-600 font-medium"
                                                                    : ""
                                                            }`}
                                                            onClick={() => {
                                                                setTempTimeSelection(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        hour: hour,
                                                                    })
                                                                );
                                                            }}
                                                        >
                                                            {hour}
                                                        </div>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="text-xs text-gray-500">
                                                Minute
                                            </div>
                                            <ScrollArea className="h-[120px] w-16">
                                                <div className="flex flex-col">
                                                    {minutes.map((minute) => (
                                                        <div
                                                            key={minute}
                                                            className={`px-2 py-1 text-center hover:bg-gray-100 cursor-pointer rounded text-sm ${
                                                                tempTimeSelection.minute ===
                                                                minute
                                                                    ? "bg-blue-100 text-blue-600 font-medium"
                                                                    : ""
                                                            }`}
                                                            onClick={() => {
                                                                setTempTimeSelection(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        minute: minute,
                                                                    })
                                                                );
                                                            }}
                                                        >
                                                            {minute}
                                                        </div>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="text-xs text-gray-500">
                                                AM/PM
                                            </div>
                                            <ScrollArea className="h-[120px] w-16">
                                                <div className="flex flex-col">
                                                    {periods.map((period) => (
                                                        <div
                                                            key={period}
                                                            className={`px-2 py-1 text-center hover:bg-gray-100 cursor-pointer rounded text-sm ${
                                                                tempTimeSelection.period ===
                                                                period
                                                                    ? "bg-blue-100 text-blue-600 font-medium"
                                                                    : ""
                                                            }`}
                                                            onClick={() => {
                                                                setTempTimeSelection(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        period: period,
                                                                    })
                                                                );
                                                            }}
                                                        >
                                                            {period}
                                                        </div>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleTimeDone}
                                        className="mt-2"
                                    >
                                        Done
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>

                        {(selectedDate || selectedTime) && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearDateTime}
                                className="text-xs h-[30px] px-2 rounded-2xl border-gray-300 shadow-none"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    <div className="text-sm flex flex-col flex-wrap w-full ">
                        {isCategoryListVisible && (
                            <div className="flex flex-col gap-2 bg-neutral-800/5 px-2 py-2">
                                <ScrollArea className="h-[200px]">
                                    <div className="flex flex-col">
                                        {filteredCategories?.map((cat) => (
                                            <div
                                                key={cat.cat_id}
                                                className="px-3 py-2 hover:bg-white/50 cursor-pointer rounded-md"
                                                onMouseDown={() => {
                                                    setSelectedCategory(
                                                        cat.cat_id
                                                    );
                                                    setCategorySearch(
                                                        cat.cat_name
                                                    );
                                                    setIsCategoryListVisible(
                                                        false
                                                    );
                                                }}
                                            >
                                                {cat.cat_name}
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        )}
                        <div className="flex flex-row items-center justify-between px-5 gap-2">
                            <div className="text-sm flex-1/3 text-neutral-500">
                                Category
                            </div>
                            <div className="flex items-center gap-2 flex-1">
                                <Input
                                    type="text"
                                    className="border-none"
                                    placeholder="None"
                                    value={categorySearch}
                                    onFocus={() =>
                                        setIsCategoryListVisible(true)
                                    }
                                    onBlur={() =>
                                        setIsCategoryListVisible(false)
                                    }
                                    onChange={(e) =>
                                        setCategorySearch(e.target.value)
                                    }
                                    onKeyDown={handleCategoryKeyDown}
                                />
                                {selectedCategory && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedCategory(null);
                                            setCategorySearch("");
                                        }}
                                        className="text-xs h-[30px] px-2 rounded-2xl border-gray-300 shadow-none"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="text-sm flex flex-col flex-wrap w-full">
                        {isPriorityListVisible && (
                            <div className="flex flex-col gap-2 bg-neutral-800/5 px-2 py-2">
                                <ScrollArea className="h-auto">
                                    <div className="flex flex-col">
                                        {PRIORITIES.map((p) => (
                                            <div
                                                key={p}
                                                className="px-3 py-2 hover:bg-white/50 cursor-pointer rounded-md"
                                                onMouseDown={() => {
                                                    setSelectedPriority(p);
                                                    setIsPriorityListVisible(
                                                        false
                                                    );
                                                }}
                                            >
                                                {p}
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        )}
                        <div className="flex flex-row items-center justify-between px-5 gap-2">
                            <div className="text-sm flex-1/3 text-neutral-500">
                                Priority
                            </div>
                            <div className="flex items-center gap-2 flex-1">
                                <Input
                                    type="text"
                                    className="border-none"
                                    placeholder="None"
                                    value={selectedPriority}
                                    onFocus={() =>
                                        setIsPriorityListVisible(true)
                                    }
                                    onBlur={() =>
                                        setIsPriorityListVisible(false)
                                    }
                                    readOnly
                                />
                                {selectedPriority &&
                                    selectedPriority !== "None" && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedPriority("None");
                                            }}
                                            className="text-xs h-[30px] px-2 rounded-2xl border-gray-300 shadow-none"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                            </div>
                        </div>
                    </div>
                    <Textarea
                        placeholder="Add a description..."
                        value={taskDescription}
                        onChange={handleDescriptionChange}
                        className="w-full px-5 py-3 outline-none border-none focus:ring-0 focus:ring-offset-0  overflow-hidden resize-none"
                        rows={1}
                    />
                </div>
                {/* Add Task Input */}
                <div className="flex h-[80px] flex-row items-center justify-between rounded-2xl bg-neutral-800 transition-all duration-150">
                    <input
                        placeholder="Add Task"
                        value={taskTitle}
                        onChange={handleTaskTitleChange}
                        onKeyDown={handleKeyDown}
                        className="w-full h-full outline-none border-none focus:ring-0 focus:ring-offset-0 p-5 pe-[88px] text-lg text-white placeholder:text-white/50"
                    />
                </div>
            </div>
        );
    }
);

AddTaskBar.displayName = "AddTaskBar";

export default AddTaskBar;
