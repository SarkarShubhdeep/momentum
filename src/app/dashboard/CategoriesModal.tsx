import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Category } from "@/types/category";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { useState, useRef } from "react";

interface CategoriesModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
    onAddCategory?: (categoryName: string) => Promise<void>;
    onUpdateCategoryName?: (catId: string, newName: string) => Promise<void>;
}

export default function CategoriesModal({
    isOpen,
    onClose,
    categories,
    onAddCategory,
    onUpdateCategoryName,
}: CategoriesModalProps) {
    const [newCategoryName, setNewCategoryName] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingValue, setEditingValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleAddCategory = async () => {
        if (!newCategoryName.trim() || !onAddCategory) return;

        try {
            setIsAdding(true);
            await onAddCategory(newCategoryName.trim());
            setNewCategoryName("");
        } catch (error) {
            console.error("Error adding category:", error);
        } finally {
            setIsAdding(false);
        }
    };

    const handleEdit = (catId: string, currentName: string) => {
        setEditingId(catId);
        setEditingValue(currentName);
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    };

    const handleEditBlur = async (catId: string) => {
        setEditingId(null);
        if (
            editingValue.trim() &&
            editingValue !==
                categories.find((c) => c.cat_id === catId)?.cat_name &&
            onUpdateCategoryName
        ) {
            await onUpdateCategoryName(catId, editingValue.trim());
        }
    };

    const handleEditKeyDown = async (
        e: React.KeyboardEvent<HTMLInputElement>,
        catId: string
    ) => {
        if (e.key === "Enter") {
            inputRef.current?.blur();
        } else if (e.key === "Escape") {
            setEditingId(null);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="sm:max-w-[500px] rounded-2xl p-0 overflow-hidden gap-0 border-none"
                showCloseButton={false}
            >
                <DialogHeader className="absolute top-0 left-0 z-10 backdrop-blur-md flex flex-col w-full justify-between items-center p-4 bg-neutral-800/10 rounded-2xl">
                    <div className="flex gap-2 items-center w-full justify-between">
                        <DialogTitle className="text-xl font-semibold">
                            Categories
                        </DialogTitle>
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="rounded-full h-8 w-8 p-0"
                        >
                            <Image
                                src="/icons/close.svg"
                                alt="close-icon"
                                width={18}
                                height={18}
                            />
                        </Button>
                    </div>
                    <div className="flex flex-row gap-2 items-center w-full justify-between mt-2">
                        <div className="focus-within:ring-0 w-full flex flex-row gap-2  items-center border border-neutral-800/20 rounded-lg">
                            <Input
                                placeholder="Add new category"
                                value={newCategoryName}
                                onChange={(e) =>
                                    setNewCategoryName(e.target.value)
                                }
                                className="rounded-full bg-transparent focus-visible:ring-0 focus-visible:border-input h-10 outline-none border-none"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !isAdding) {
                                        handleAddCategory();
                                    }
                                }}
                            />
                            <Button
                                variant="ghost"
                                onClick={handleAddCategory}
                                disabled={!newCategoryName.trim() || isAdding}
                                className="rounded-md h-10 w-10 p-0 hover:bg-blue-500/80 hover:text-white "
                            >
                                <Image
                                    src="/icons/add.svg"
                                    alt="add-category-icon"
                                    width={20}
                                    height={20}
                                />
                            </Button>
                        </div>
                    </div>
                </DialogHeader>
                <ScrollArea className="max-h-[600px]  p-2 overflow-hidden  ">
                    <div className="space-y-2 pt-[120px]">
                        {categories.map((category) => (
                            <div
                                key={category.cat_id}
                                className="flex items-center justify-between px-4 py-2 rounded-lg hover:bg-blue-500/20 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    {editingId === category.cat_id ? (
                                        <Input
                                            ref={inputRef}
                                            value={editingValue}
                                            onChange={(e) =>
                                                setEditingValue(e.target.value)
                                            }
                                            onBlur={() =>
                                                handleEditBlur(category.cat_id)
                                            }
                                            onKeyDown={(e) =>
                                                handleEditKeyDown(
                                                    e,
                                                    category.cat_id
                                                )
                                            }
                                            className="font-medium h-8 px-2 py-1 rounded bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700"
                                        />
                                    ) : (
                                        <span
                                            className="font-medium cursor-pointer hover:underline"
                                            onClick={() =>
                                                handleEdit(
                                                    category.cat_id,
                                                    category.cat_name
                                                )
                                            }
                                        >
                                            {category.cat_name}
                                        </span>
                                    )}
                                </div>
                                <span className="text-sm font-mono">
                                    {category.task_count || 0} tasks
                                </span>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
