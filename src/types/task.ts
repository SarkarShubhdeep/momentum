export interface Task {
    id: string;
    task_title: string;
    task_desc?: string;
    task_priority?: "High" | "Medium" | "Low" | "None";
    task_time?: string;
    user_id: string;
    status?: boolean;
    created_at?: string;
    updated_at?: string;
    cat_id?: string;
    task_date?: string;
    task_only_time?: string;
    // Legacy fields for backward compatibility
    title?: string;
    description?: string;
    priority?: "High" | "Medium" | "Low" | "None";
    time?: string;
    completed?: boolean;
    category?: string;
}

export type TaskPriority = "High" | "Medium" | "Low" | "None";
