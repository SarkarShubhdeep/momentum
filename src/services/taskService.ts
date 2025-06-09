import { supabase } from "@/lib/supabase";
import { Task } from "@/types/task";

export const taskService = {
    async getTasks(userId: string): Promise<Task[]> {
        const { data, error } = await supabase
            .from("tasks")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching tasks:", error);
            throw error;
        }

        return data || [];
    },

    async createTask(
        task: Omit<Task, "id" | "created_at" | "updated_at">
    ): Promise<Task> {
        const { data, error } = await supabase
            .from("tasks")
            .insert([task])
            .select()
            .single();

        if (error) {
            console.error("Error creating task:", error);
            throw error;
        }

        return data;
    },

    async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
        const { data, error } = await supabase
            .from("tasks")
            .update(updates)
            .eq("id", taskId)
            .select()
            .single();

        if (error) {
            console.error("Error updating task:", error);
            throw error;
        }

        return data;
    },

    async updateTaskStatus(taskId: string, status: boolean): Promise<Task> {
        const { data, error } = await supabase
            .from("tasks")
            .update({ status })
            .eq("id", taskId)
            .select()
            .single();

        if (error) {
            console.error("Error updating task status:", error);
            throw error;
        }

        return data;
    },

    async deleteTask(taskId: string): Promise<void> {
        const { error } = await supabase
            .from("tasks")
            .delete()
            .eq("id", taskId);

        if (error) {
            console.error("Error deleting task:", error);
            throw error;
        }
    },
};
