"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LayoutGrid from "@/components/LayoutGrid";

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
    const [editing, setEditing] = useState(false);
    const [fullName, setFullName] = useState("");
    const [bio, setBio] = useState("");
    const [saving, setSaving] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(false);
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
                setFullName(profile.full_name || "");
                setBio(profile.bio || "");
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

    const handleSaveProfile = async () => {
        if (!user) return;

        setSaving(true);
        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    full_name: fullName,
                    bio: bio,
                })
                .eq("id", user.id);

            if (error) throw error;

            setProfile((prev) =>
                prev
                    ? {
                          ...prev,
                          full_name: fullName,
                          bio: bio,
                      }
                    : null
            );

            setEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setSaving(false);
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
            <LayoutGrid theme="light" />
            <div className="min-h-screen bg-[var(--background)]">
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
                <nav className="border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16 items-center">
                            <h1 className="text-xl font-semibold">Dashboard</h1>
                            <button
                                onClick={handleSignOut}
                                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-black/90"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold">
                                Profile Information
                            </h2>
                            {!editing ? (
                                <button
                                    onClick={() => setEditing(true)}
                                    className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-black/90"
                                >
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="space-x-2">
                                    <button
                                        onClick={() => {
                                            setEditing(false);
                                            setFullName(
                                                profile?.full_name || ""
                                            );
                                            setBio(profile?.bio || "");
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={saving}
                                        className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-black/90 disabled:opacity-50"
                                    >
                                        {saving ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div>
                                <Label>Email</Label>
                                <div className="mt-1 text-lg">
                                    {user?.email}
                                </div>
                            </div>

                            {editing ? (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="full-name">
                                            Full Name
                                        </Label>
                                        <Input
                                            id="full-name"
                                            value={fullName}
                                            onChange={(e) =>
                                                setFullName(e.target.value)
                                            }
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <Input
                                            id="bio"
                                            value={bio}
                                            onChange={(e) =>
                                                setBio(e.target.value)
                                            }
                                            placeholder="Tell us about yourself"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <Label>Full Name</Label>
                                        <div className="mt-1 text-lg">
                                            {profile?.full_name || "Not set"}
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Bio</Label>
                                        <div className="mt-1 text-gray-600">
                                            {profile?.bio || "No bio yet"}
                                        </div>
                                    </div>
                                </>
                            )}

                            <div>
                                <Label>Member Since</Label>
                                <div className="mt-1 text-sm text-gray-500">
                                    {profile?.created_at
                                        ? new Date(
                                              profile.created_at
                                          ).toLocaleDateString()
                                        : "N/A"}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
