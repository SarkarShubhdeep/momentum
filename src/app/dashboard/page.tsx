"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LayoutGrid from "@/components/LayoutGrid";
import UserProfile from "./UserProfile";
import TasksNavbar from "./TasksNavbar";
import {
    Clock,
    Filter,
    FilterX,
    LogOut,
    SortAsc,
    UserCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import TodoCard from "./TodoCard";
import { Task, TaskPriority } from "@/types/task";
import { taskService } from "@/services/taskService";
import { categoryService } from "@/services/categoryService";
import { Category } from "@/types/category";
import { toast, Toaster } from "sonner";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import AddTaskContainer from "./AddTaskContainer";
import { RiveLoader } from "@/components/ui/rive-loader";

interface Profile {
    id: string;
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
    preferences: any;
    created_at: string;
    updated_at: string;
}

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [showTaskMenu, setShowTaskMenu] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkScreen = () => {
            setIsSmallScreen(window.innerWidth < 1024);
        };
        checkScreen();
        window.addEventListener("resize", checkScreen);
        return () => window.removeEventListener("resize", checkScreen);
    }, []);

    useEffect(() => {
        const getUserAndData = async () => {
            try {
                const {
                    data: { user },
                    error,
                } = await supabase.auth.getUser();

                if (error) {
                    throw error;
                }

                if (!user) {
                    router.push("/");
                    return;
                }

                setUser(user);

                // Fetch profile
                const { data: profile, error: profileError } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();

                if (profileError) {
                    throw profileError;
                }

                setProfile(profile);

                // Fetch tasks and categories in parallel
                const [userTasks, fetchedCategories] = await Promise.all([
                    taskService.getTasks(user.id),
                    categoryService.getCategories(),
                ]);
                setCategories(fetchedCategories);
                // Map Supabase fields to expected fields and resolve category name
                const mappedTasks = userTasks.map((task: any) => {
                    const catId = task.cat_id || task.category_id;
                    const categoryObj = fetchedCategories.find(
                        (cat) => cat.cat_id === catId
                    );
                    let mappedPriority: TaskPriority = "None";
                    if (
                        task.task_priority === "High" ||
                        task.task_priority === "Medium" ||
                        task.task_priority === "Low" ||
                        task.task_priority === "None"
                    ) {
                        mappedPriority = task.task_priority;
                    }
                    return {
                        ...task,
                        title: task.task_title,
                        description: task.task_desc,
                        priority: mappedPriority,
                        time: task.task_time,
                        task_date: task.task_date,
                        task_only_time: task.task_only_time,
                        category: categoryObj
                            ? categoryObj.cat_name
                            : "No Category",
                    };
                });
                setTasks(mappedTasks);
            } catch (error) {
                console.error("Error loading user:", error);
                router.push("/");
            } finally {
                setLoading(false);
            }
        };

        getUserAndData();

        // Set up auth state listener
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                router.push("/");
            } else {
                setUser(session.user);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [router]);

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
            router.push("/");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const handleStatusChange = async (taskId: string, checked: boolean) => {
        try {
            await taskService.updateTaskStatus(taskId, checked);
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === taskId ? { ...task, status: checked } : task
                )
            );
        } catch (error) {
            console.error("Error updating task status:", error);
        }
    };

    const handleTitleChange = async (taskId: string, newTitle: string) => {
        try {
            await taskService.updateTask(taskId, { task_title: newTitle });
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === taskId ? { ...task, title: newTitle } : task
                )
            );
            toast(`${newTitle} task updated successfully`);
        } catch (error) {
            console.error("Error updating task title:", error);
        }
    };

    const handleDescriptionChange = async (
        taskId: string,
        newDescription: string
    ) => {
        try {
            await taskService.updateTask(taskId, {
                task_desc: newDescription,
            } as any);
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === taskId
                        ? { ...task, description: newDescription }
                        : task
                )
            );
            // Use the updated title for the toast message
            const updatedTask = tasks.find((task) => task.id === taskId);
            const title = updatedTask ? updatedTask.title : "Task";
            toast(`${title} task updated successfully`);
        } catch (error) {
            console.error("Error updating task description:", error);
        }
    };

    const handleDateChange = async (taskId: string, newDate: string) => {
        try {
            await taskService.updateTask(taskId, { task_date: newDate } as any);
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === taskId ? { ...task, task_date: newDate } : task
                )
            );
            const updatedTask = tasks.find((task) => task.id === taskId);
            const title = updatedTask ? updatedTask.title : "Task";
            toast(`${title} task updated successfully`);
        } catch (error) {
            console.error("Error updating task date:", error);
        }
    };

    const handleTimeChange = async (taskId: string, newTime: string) => {
        try {
            await taskService.updateTask(taskId, {
                task_only_time: newTime,
            } as any);
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === taskId
                        ? { ...task, task_only_time: newTime }
                        : task
                )
            );
            const updatedTask = tasks.find((task) => task.id === taskId);
            const title = updatedTask ? updatedTask.title : "Task";
            toast(`${title} task updated successfully`);
        } catch (error) {
            console.error("Error updating task time:", error);
        }
    };

    const handlePriorityChange = async (
        taskId: string,
        newPriority: string
    ) => {
        try {
            await taskService.updateTask(taskId, {
                task_priority: newPriority as TaskPriority,
            });
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === taskId
                        ? { ...task, priority: newPriority as TaskPriority }
                        : task
                )
            );
            toast("Priority updated!");
        } catch (error) {
            console.error("Error updating task priority:", error);
        }
    };

    const handleCategoryChange = async (
        taskId: string,
        newCategory: string
    ) => {
        try {
            const updateData = newCategory
                ? { cat_id: newCategory }
                : { cat_id: null };
            await taskService.updateTask(taskId, updateData as any);

            const categoryObj = categories.find(
                (cat) => cat.cat_id === newCategory
            );
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === taskId
                        ? {
                              ...task,
                              cat_id: newCategory ? newCategory : undefined,
                              category: categoryObj
                                  ? categoryObj.cat_name
                                  : "No Category",
                          }
                        : task
                )
            );
            toast("Category updated!");
        } catch (error) {
            console.error("Error updating task category:", error);
        }
    };

    const handleDuplicateTask = async (taskId: string) => {
        try {
            const taskToDuplicate = tasks.find((task) => task.id === taskId);
            if (!taskToDuplicate) return;

            const duplicateData = {
                task_title: `${taskToDuplicate.title} (Copy)`,
                task_desc: taskToDuplicate.description,
                task_priority: taskToDuplicate.priority,
                cat_id: taskToDuplicate.cat_id,
                user_id: user?.id || "",
                status: false,
                task_date: taskToDuplicate.task_date,
                task_only_time: taskToDuplicate.task_only_time,
            };

            const newTask = await taskService.createTask(duplicateData);

            // Map the new task to match the expected format
            const catId = newTask.cat_id;
            const categoryObj = categories.find((cat) => cat.cat_id === catId);
            const mappedTask = {
                ...newTask,
                title: newTask.task_title,
                description: newTask.task_desc || "",
                priority: newTask.task_priority,
                time: newTask.task_time || "",
                task_date: newTask.task_date,
                task_only_time: newTask.task_only_time,
                category: categoryObj ? categoryObj.cat_name : "No Category",
            };

            setTasks((prevTasks) => [mappedTask, ...prevTasks]);
            toast("Task duplicated successfully!");
        } catch (error) {
            console.error("Error duplicating task:", error);
            toast.error("Failed to duplicate task");
        }
    };

    const handleArchiveTask = async (taskId: string) => {
        try {
            // For now, we'll just mark it as completed (archived)
            await taskService.updateTaskStatus(taskId, true);
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === taskId ? { ...task, status: true } : task
                )
            );
            toast("Task archived!");
        } catch (error) {
            console.error("Error archiving task:", error);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            await taskService.deleteTask(taskId);
            setTasks((prevTasks) =>
                prevTasks.filter((task) => task.id !== taskId)
            );
            toast("Task deleted successfully!");
        } catch (error) {
            console.error("Error deleting task:", error);
            toast.error("Failed to delete task");
        }
    };

    // Handler to update categories and also update tasks' category name in real time
    const handleCategoriesUpdate = (updatedCategories: Category[]) => {
        setCategories(updatedCategories);
        setTasks((prevTasks) =>
            prevTasks.map((task) => {
                const catId = task.cat_id;
                const updatedCat = updatedCategories.find(
                    (cat) => cat.cat_id === catId
                );
                if (updatedCat) {
                    return {
                        ...task,
                        category: updatedCat.cat_name,
                    };
                }
                return task;
            })
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                <RiveLoader className="w-50 h-50" />
            </div>
        );
    }

    return (
        <>
            <Toaster position="bottom-right" />
            {/* <LayoutGrid theme="light" /> */}

            {/* User Profile */}
            <UserProfile
                open={profileOpen}
                onClose={() => setProfileOpen(false)}
                profile={profile}
                email={user?.email}
                onProfileUpdate={setProfile}
            />

            {/* Dashboard */}
            <div className="min-h-screen bg-[var(--background)] mx-5 md:mx-20 lg:mx-[120px] py-[20px] ">
                <div className="fixed top-4 right-4 z-50">
                    <ThemeToggle />
                </div>
                {isSmallScreen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
                        <div className="bg-white rounded-lg p-8 shadow-xl text-center max-w-xs mx-auto">
                            <h2 className="text-xl font-bold mb-2">
                                Screen Too Small
                            </h2>
                            <p className="text-gray-700 mb-4">
                                Please make your browser window larger to use
                                this app.
                            </p>
                        </div>
                    </div>
                )}
                <div className="flex gap-4 h-full">
                    <div className="flex justify-between items-center min-h-full w-[400px] max-h-[calc(100vh-40px)] 0  rounded-xl overflow-hidden">
                        <div className="relative h-full w-full">
                            <TasksNavbar
                                showTaskMenu={showTaskMenu}
                                setShowTaskMenu={setShowTaskMenu}
                                categories={categories}
                                onCategoriesUpdate={handleCategoriesUpdate}
                                userId={user?.id || ""}
                            />
                            <AddTaskContainer
                                categories={categories}
                                userId={user?.id || ""}
                                onAddTask={(newTask: any) => {
                                    // Map the new task to match the expected format
                                    const catId = newTask.cat_id;
                                    const categoryObj = categories.find(
                                        (cat) => cat.cat_id === catId
                                    );
                                    const mappedTask = {
                                        ...newTask,
                                        title: newTask.task_title ?? "No Title",
                                        description: newTask.task_desc ?? "",
                                        priority: newTask.task_priority,
                                        time: newTask.task_time ?? "",
                                        task_date: newTask.task_date,
                                        task_only_time: newTask.task_only_time,
                                        category: categoryObj
                                            ? categoryObj.cat_name
                                            : "No Category",
                                    };
                                    setTasks((prevTasks) => [
                                        mappedTask,
                                        ...prevTasks,
                                    ]);
                                }}
                                onCategoriesUpdate={handleCategoriesUpdate}
                            />
                            <ScrollArea className="h-full ">
                                <div className="space-y-2 py-[86px]">
                                    {tasks.map((task) => (
                                        <TodoCard
                                            key={task.id}
                                            id={task.id}
                                            title={task.title || "No Title"}
                                            description={task.description || ""}
                                            priority={task.priority}
                                            time={task.time || ""}
                                            task_date={task.task_date || ""}
                                            task_only_time={
                                                task.task_only_time || ""
                                            }
                                            category={task.category}
                                            status={task.status}
                                            categories={categories}
                                            onStatusChange={(checked) =>
                                                handleStatusChange(
                                                    task.id,
                                                    checked as boolean
                                                )
                                            }
                                            onTitleChange={(newTitle) =>
                                                handleTitleChange(
                                                    task.id,
                                                    newTitle
                                                )
                                            }
                                            onDescriptionChange={(
                                                newDescription
                                            ) =>
                                                handleDescriptionChange(
                                                    task.id,
                                                    newDescription
                                                )
                                            }
                                            onDateChange={(newDate) =>
                                                handleDateChange(
                                                    task.id,
                                                    newDate
                                                )
                                            }
                                            onTimeChange={(newTime) =>
                                                handleTimeChange(
                                                    task.id,
                                                    newTime
                                                )
                                            }
                                            onPriorityChange={(newPriority) =>
                                                handlePriorityChange(
                                                    task.id,
                                                    newPriority
                                                )
                                            }
                                            onCategoryChange={(newCategory) =>
                                                handleCategoryChange(
                                                    task.id,
                                                    newCategory
                                                )
                                            }
                                            onDuplicate={(taskId) =>
                                                handleDuplicateTask(taskId)
                                            }
                                            onArchive={(taskId) =>
                                                handleArchiveTask(taskId)
                                            }
                                            onDelete={(taskId) =>
                                                handleDeleteTask(taskId)
                                            }
                                        />
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                    <div className="flex justify-between items-center h-full flex-1 min-h-full">
                        <nav className="border-b h-[120px] p-6 w-full">
                            <div className="max-w-full mx-auto h-full">
                                <div className="flex justify-between h-full items-center ">
                                    <h1 className="text-xl font-semibold">
                                        Dashboard
                                    </h1>
                                    <div className="flex items-center gap-4">
                                        <Avatar
                                            onClick={() => setProfileOpen(true)}
                                            className="cursor-pointer h-10 w-10 border border-black"
                                        >
                                            <AvatarImage
                                                src={profile?.avatar_url || ""}
                                            />
                                            <AvatarFallback>
                                                {profile?.full_name?.[0] || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <button
                                            onClick={handleSignOut}
                                            className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-black/90"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </nav>
                    </div>
                </div>
            </div>
        </>
    );
}
