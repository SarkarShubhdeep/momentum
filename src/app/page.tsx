"use client";

import LayoutGrid from "@/components/LayoutGrid";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function Home() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [bio, setBio] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showSignupPassword, setShowSignupPassword] = useState(false);
    useEffect(() => {
        const checkScreen = () => {
            setIsSmallScreen(window.innerWidth < 1024);
        };
        checkScreen();
        window.addEventListener("resize", checkScreen);
        return () => window.removeEventListener("resize", checkScreen);
    }, []);

    const toggleForm = () => {
        setIsLogin(!isLogin);
        setError(null);
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setFullName("");
        setBio("");
        setShowLoginPassword(false);
        setShowSignupPassword(false);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            router.push("/dashboard");
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (error) throw error;

            // Create profile
            if (data.user) {
                const { error: profileError } = await supabase
                    .from("profiles")
                    .insert([
                        {
                            id: data.user.id,
                            full_name: fullName,
                            bio: bio,
                        },
                    ]);

                if (profileError) throw profileError;
            }

            setError("Check your email for the confirmation link!");
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {isSmallScreen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
                    <div className="bg-white rounded-lg p-8 shadow-xl text-center max-w-xs mx-auto">
                        <h2 className="text-xl font-bold mb-2">
                            Screen Too Small
                        </h2>
                        <p className="text-gray-700 mb-4">
                            Please make your browser window larger to use this
                            app.
                        </p>
                    </div>
                </div>
            )}
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                <div className="fixed top-4 right-4 z-50">
                    <ThemeToggle />
                </div>
                {/* <LayoutGrid theme="light" /> */}

                <div className="flex flex-col items-center justify-center gap-4 py-8 h-screen min-w-[400px] border-x ">
                    <div className="w-full max-w-sm space-y-4">
                        {/* Login Form */}
                        <div
                            className={`${
                                isLogin ? "" : "hidden"
                            } w-full space-y-6 p-4`}
                        >
                            <div className="space-y-2 ">
                                <h1 className="text-2xl font-semibold tracking-tight">
                                    Login
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Enter your credentials to login
                                </p>
                            </div>
                            {error && (
                                <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">
                                    {error}
                                </div>
                            )}
                            <form className="space-y-4" onSubmit={handleLogin}>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="flex gap-1">
                                        <Input
                                            id="password"
                                            type={
                                                showLoginPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            required
                                        />
                                        <Button
                                            variant={
                                                showLoginPassword
                                                    ? "default"
                                                    : "outline"
                                            }
                                            className="shadow-none"
                                            size="icon"
                                            onClick={() => {
                                                setShowLoginPassword(
                                                    !showLoginPassword
                                                );
                                            }}
                                            type="button"
                                        >
                                            <EyeIcon className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <button
                                    className="w-full rounded-md bg-black px-8 py-2 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-50"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? "Loading..." : "Login"}
                                </button>
                            </form>
                            <p className="text-center text-sm text-muted-foreground">
                                New user?{" "}
                                <button
                                    className="text-primary hover:underline"
                                    onClick={toggleForm}
                                >
                                    Create an account
                                </button>
                            </p>
                        </div>

                        {/* Sign Up Form */}
                        <div
                            className={`${
                                isLogin ? "hidden" : ""
                            } w-full space-y-4 p-4`}
                        >
                            <div className="space-y-2 ">
                                <h1 className="text-2xl font-semibold tracking-tight">
                                    Sign Up
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Create a new account
                                </p>
                            </div>
                            {error && (
                                <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">
                                    {error}
                                </div>
                            )}
                            <form className="space-y-4" onSubmit={handleSignUp}>
                                <div className="space-y-2">
                                    <Label htmlFor="full-name">Full Name</Label>
                                    <Input
                                        id="full-name"
                                        type="text"
                                        placeholder="John Doe"
                                        value={fullName}
                                        onChange={(e) =>
                                            setFullName(e.target.value)
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-email">Email</Label>
                                    <Input
                                        id="signup-email"
                                        type="email"
                                        placeholder="m@example.com"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-password">
                                        Password
                                    </Label>
                                    <div className="flex gap-1">
                                        <Input
                                            id="signup-password"
                                            type={
                                                showSignupPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            required
                                        />
                                        <Button
                                            variant={
                                                showSignupPassword
                                                    ? "default"
                                                    : "outline"
                                            }
                                            className="shadow-none"
                                            size="icon"
                                            onClick={() => {
                                                setShowSignupPassword(
                                                    !showSignupPassword
                                                );
                                            }}
                                            type="button"
                                        >
                                            <EyeIcon className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">
                                        Confirm Password
                                    </Label>
                                    <div className="flex">
                                        <Input
                                            id="confirm-password"
                                            type={
                                                showSignupPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={confirmPassword}
                                            onChange={(e) =>
                                                setConfirmPassword(
                                                    e.target.value
                                                )
                                            }
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <Input
                                        id="bio"
                                        type="text"
                                        placeholder="Tell us about yourself"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full"
                                >
                                    {loading ? "Loading..." : "Sign Up"}
                                </Button>
                            </form>
                            <p className="text-center text-sm text-muted-foreground">
                                Already have an account?{" "}
                                <button
                                    className="text-primary hover:underline"
                                    onClick={toggleForm}
                                >
                                    Login
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
