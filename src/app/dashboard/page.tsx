"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LayoutGrid from "@/components/LayoutGrid";
import UserProfile from "./UserProfile";
import { Clock, UserCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import TodoCard from "./TodoCard";

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
    const [loading, setLoading] = useState(true);
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
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
        const getUser = async () => {
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
            } catch (error) {
                console.error("Error loading user:", error);
                router.push("/");
            } finally {
                setLoading(false);
            }
        };

        getUser();

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

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <>
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
            <div className="min-h-screen bg-[var(--background)] mx-5 md:mx-20 lg:mx-[120px] py-[80px]">
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
                <div className="flex gap-4 h-full ">
                    <div className="flex justify-between items-center min-h-full w-[400px] max-h-[calc(100vh-160px)] ">
                        <div className="relative h-full w-full">
                            <nav className="absolute top-0 left-0 right-0 border-b h-[120px] p-6 w-full bg-white/80 backdrop-blur-sm z-10">
                                <div className="max-w-full mx-auto h-full">
                                    <div className="flex justify-between h-full items-center">
                                        <h1 className="text-xl font-semibold">
                                            Tasks
                                        </h1>
                                        <div className="flex items-center gap-4">
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
                            <ScrollArea className="h-full ">
                                <div className="space-y-2 pt-[124px]">
                                    {Array.from({ length: 20 }, (_, i) => ({
                                        title: `Task ${i + 1}`,
                                        description: `Description for task ${
                                            i + 1
                                        }`,
                                        priority:
                                            i % 3 === 0
                                                ? "High"
                                                : i % 3 === 1
                                                ? "Medium"
                                                : "Low",
                                        time: "10:00 AM",
                                    })).map((task, index) => (
                                        <TodoCard
                                            key={index}
                                            id={`task-${index}`}
                                            title={task.title}
                                            description={task.description}
                                            priority={
                                                task.priority as
                                                    | "High"
                                                    | "Medium"
                                                    | "Low"
                                            }
                                            time={task.time}
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
