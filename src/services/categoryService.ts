import { supabase } from "@/lib/supabase";
import { Category } from "@/types/category";

export const categoryService = {
    async getCategories(): Promise<Category[]> {
        const { data, error } = await supabase.from("categories").select("*");
        if (error) throw error;
        console.log("Fetched categories:", data);
        return data || [];
    },
};
