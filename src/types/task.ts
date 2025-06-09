export interface Task {
    id: string;
    title: string;
    description: string;
    priority: "High" | "Medium" | "Low";
    time: string;
    user_id: string;
    completed: boolean;
    created_at: string;
    updated_at: string;
    category?: string;
    cat_id?: string;
    status?: boolean;
    task_title?: string;
    task_date?: string;
    task_only_time?: string;
}

export type TaskPriority = "High" | "Medium" | "Low";
