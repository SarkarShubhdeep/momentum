import { supabase } from "@/lib/supabase";
import { Category } from "@/types/category";

export const categoryService = {
    async getCategories(): Promise<Category[]> {
        const { data, error } = await supabase
            .from("categories")
            .select("*")
            .order("cat_name");

        if (error) {
            console.error("Error fetching categories:", error);
            throw error;
        }

        return data || [];
    },

    async createCategory(
        categoryName: string,
        userId: string
    ): Promise<Category> {
        const { data, error } = await supabase
            .from("categories")
            .insert([
                {
                    cat_name: categoryName,
                    user_id: userId,
                },
            ])
            .select()
            .single();

        if (error) {
            console.error("Error creating category:", error);
            throw error;
        }

        return data;
    },

    async updateCategoryName(
        catId: string,
        newName: string
    ): Promise<Category> {
        const { data, error } = await supabase
            .from("categories")
            .update({ cat_name: newName })
            .eq("cat_id", catId)
            .select()
            .single();
        if (error) {
            console.error("Error updating category name:", error);
            throw error;
        }
        return data;
    },
};
