import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { RiveLoader } from "@/components/ui/rive-loader";

// Define Profile type locally to avoid import error
export interface Profile {
    id: string;
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
    preferences: any;
    created_at: string;
    updated_at: string;
}

interface UserProfileProps {
    open: boolean;
    onClose: () => void;
    profile: Profile | null;
    email: string | null | undefined;
    onProfileUpdate?: (profile: Profile) => void;
}

export default function UserProfile({
    open,
    onClose,
    profile,
    email,
    onProfileUpdate,
}: UserProfileProps) {
    const [editing, setEditing] = useState(false);
    const [fullName, setFullName] = useState(profile?.full_name || "");
    const [bio, setBio] = useState(profile?.bio || "");
    const [saving, setSaving] = useState(false);

    // Sync state with profile prop
    useEffect(() => {
        setFullName(profile?.full_name || "");
        setBio(profile?.bio || "");
    }, [profile]);

    const handleSaveProfile = async () => {
        if (!profile) return;
        setSaving(true);
        try {
            const { data, error } = await supabase
                .from("profiles")
                .update({
                    full_name: fullName,
                    bio: bio,
                })
                .eq("id", profile.id)
                .select()
                .single();
            if (error) throw error;
            setEditing(false);
            if (onProfileUpdate && data) onProfileUpdate(data);
        } catch (error) {
            // Optionally show error
            // eslint-disable-next-line no-console
            console.error("Error updating profile:", error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex justify-end transition-all duration-300 ${
                open ? "pointer-events-auto" : "pointer-events-none"
            }`}
        >
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-40 transition-opacity duration-300 ${
                    open ? "opacity-100" : "opacity-0"
                }`}
                onClick={onClose}
            />
            {/* Panel */}
            <aside
                className={`relative w-full max-w-sm h-full bg-white shadow-xl transform transition-transform duration-300 ${
                    open ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <button
                    className="absolute top-4 right-4 text-gray-500 hover:text-black"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <X size={24} />
                </button>
                <div className="p-8 pt-12 flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500">
                            {/* Placeholder avatar: first letter of name or email */}
                            {profile?.full_name?.[0] || email?.[0] || "U"}
                        </div>
                        <div className="text-lg font-semibold">
                            {profile?.full_name || "No Name"}
                        </div>
                        <div className="text-sm text-gray-500">{email}</div>
                    </div>
                    <div>
                        <div className="font-medium mb-1">Bio</div>
                        <div className="text-gray-700 text-sm min-h-[2rem]">
                            {profile?.bio || "No bio set."}
                        </div>
                    </div>
                    {!editing ? (
                        <button
                            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-black/90"
                            onClick={() => setEditing(true)}
                        >
                            Edit Profile
                        </button>
                    ) : (
                        <form
                            className="flex flex-col gap-4 mt-4"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSaveProfile();
                            }}
                        >
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Full Name
                                </label>
                                <Input
                                    value={fullName}
                                    onChange={(e) =>
                                        setFullName(e.target.value)
                                    }
                                    placeholder="Enter your full name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Bio
                                </label>
                                <Input
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell us about yourself"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                    onClick={() => {
                                        setEditing(false);
                                        setFullName(profile?.full_name || "");
                                        setBio(profile?.bio || "");
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-black/90 disabled:opacity-50"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <RiveLoader className="w-8 h-8" />
                                    ) : (
                                        "Save Changes"
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </aside>
        </div>
    );
}
