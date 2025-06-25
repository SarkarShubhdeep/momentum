import { useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CategoriesModal from "./CategoriesModal";
import { Category } from "@/types/category";
import { categoryService } from "@/services/categoryService";
import { toast } from "sonner";

interface TasksNavbarProps {
    showTaskMenu: boolean;
    setShowTaskMenu: (show: boolean) => void;
    categories: Category[];
    onCategoriesUpdate: (categories: Category[]) => void;
    userId: string;
}

export default function TasksNavbar({
    showTaskMenu,
    setShowTaskMenu,
    categories,
    onCategoriesUpdate,
    userId,
}: TasksNavbarProps) {
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [showCategoriesModal, setShowCategoriesModal] = useState(false);

    const handleAddCategory = async (categoryName: string) => {
        try {
            const newCategory = await categoryService.createCategory(
                categoryName,
                userId
            );
            onCategoriesUpdate([...categories, newCategory]);
            toast.success("Category added successfully");
        } catch (error) {
            console.error("Error adding category:", error);
            toast.error("Failed to add category");
            throw error;
        }
    };

    const handleUpdateCategoryName = async (catId: string, newName: string) => {
        try {
            const updated = await categoryService.updateCategoryName(
                catId,
                newName
            );
            onCategoriesUpdate(
                categories.map((cat) =>
                    cat.cat_id === catId ? { ...cat, cat_name: newName } : cat
                )
            );
            toast.success("Category updated");
        } catch (error) {
            toast.error("Failed to update category");
        }
    };

    return (
        <>
            <nav
                className={`absolute top-0 left-0 right-0 backdrop-blur-lg w-full border-1 z-10 ${
                    showTaskMenu
                        ? "rounded-2xl bg-neutral-100/10 border-neutral-400 shadow-lg"
                        : "rounded-xl bg-neutral-800/10 border-transparent"
                } overflow-hidden`}
            >
                <div className="max-w-full mx-auto h-[80px] ps-6 pe-2">
                    <div className="flex justify-between h-full items-center">
                        <h1 className="text-4xl font-semibold">Tasks</h1>
                        <div className="flex items-center gap-1">
                            {!showTaskMenu ? (
                                <Button
                                    variant="ghost"
                                    className="shadow-none rounded-full h-14 w-14 p-0 hover:hover:bg-blue-500/20"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowTaskMenu(true);
                                    }}
                                >
                                    <Image
                                        src="/icons/menu.svg"
                                        alt="menu-icon"
                                        width={32}
                                        height={32}
                                    />
                                </Button>
                            ) : (
                                <Button
                                    variant="ghost"
                                    className="shadow-none rounded-full h-14 w-14 p-0 bg-neutral-800 hover:bg-neutral-800/80 scale-80"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowTaskMenu(false);
                                    }}
                                >
                                    <Image
                                        src="/icons/close-dark.svg"
                                        alt="close-menu-icon"
                                        width={26}
                                        height={26}
                                    />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
                {showTaskMenu && (
                    <div
                        ref={menuRef}
                        className="max-w-full p-4 animate-fade-in-down"
                    >
                        <div className="flex flex-col justify-between h-full items-start">
                            <div className="flex flex-col gap-2 px-4 py-2 w-full rounded-md transition-all duration-150">
                                <div className="text-sm">
                                    Properties visible
                                </div>
                                <div className="text-sm space-x-1 space-y-1">
                                    <Badge
                                        variant="outline"
                                        className="rounded-full bg-neutral-800 text-white py-1"
                                    >
                                        Category
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="rounded-full border-neutral-400 py-1"
                                    >
                                        Priority
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="rounded-full border-neutral-400 py-1"
                                    >
                                        Description
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 px-4 py-2 w-full rounded-md transition-all duration-150">
                                <div className="text-sm">Sort by</div>
                                <div className="text-sm space-x-1 space-y-1">
                                    <Badge
                                        variant="outline"
                                        className="rounded-full bg-neutral-800 text-white py-1 pe-1"
                                    >
                                        Time
                                        <Image
                                            src="/icons/arrow-alt-up-dark.svg"
                                            alt="arrow-down-icon"
                                            width={16}
                                            height={16}
                                        />
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="rounded-full border-neutral-400 py-1 pe-1"
                                    >
                                        Time
                                        <Image
                                            src="/icons/arrow-alt-down.svg"
                                            alt="arrow-down-icon"
                                            width={16}
                                            height={16}
                                        />
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="rounded-full border-neutral-400 py-1 pe-1"
                                    >
                                        Title
                                        <Image
                                            src="/icons/arrow-alt-up.svg"
                                            alt="arrow-down-icon"
                                            width={16}
                                            height={16}
                                        />
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="rounded-full border-neutral-400 py-1 pe-1"
                                    >
                                        Title
                                        <Image
                                            src="/icons/arrow-alt-down.svg"
                                            alt="arrow-down-icon"
                                            width={16}
                                            height={16}
                                        />
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="rounded-full border-neutral-400 py-1"
                                    >
                                        Priority
                                        <Image
                                            src="/icons/arrow-alt-up.svg"
                                            alt="arrow-down-icon"
                                            width={16}
                                            height={16}
                                        />
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="rounded-full border-neutral-400 py-1"
                                    >
                                        Priority
                                        <Image
                                            src="/icons/arrow-alt-down.svg"
                                            alt="arrow-down-icon"
                                            width={16}
                                            height={16}
                                        />
                                    </Badge>
                                </div>
                            </div>
                            <div
                                className="flex items-center justify-between px-4 py-2 w-full rounded-md hover:bg-blue-500/20 hover:ps-6 cursor-pointer transition-all duration-150"
                                onClick={() => setShowCategoriesModal(true)}
                            >
                                Categories
                                <Image
                                    src="/icons/arrow-right.svg"
                                    alt="arrow-right-icon"
                                    width={18}
                                    height={18}
                                />
                            </div>
                            <div className="flex items-center justify-between px-4 py-2 w-full rounded-md hover:bg-blue-500/20 hover:ps-6 cursor-pointer transition-all duration-150">
                                Show Completed Tasks
                                <div className="h-4 w-4 bg-green-500 rounded-full"></div>
                            </div>
                            <div className="flex items-center justify-between px-4 py-2 w-full rounded-md hover:bg-red-500/20 hover:text-red-900 hover:ps-6 cursor-pointer transition-all duration-150">
                                Delete Completed Tasks
                            </div>
                        </div>
                    </div>
                )}
            </nav>
            <CategoriesModal
                isOpen={showCategoriesModal}
                onClose={() => setShowCategoriesModal(false)}
                categories={categories}
                onAddCategory={handleAddCategory}
                onUpdateCategoryName={handleUpdateCategoryName}
            />
        </>
    );
}
