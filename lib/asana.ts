/**
 * Asana API Client — Server-side only
 * Uses Personal Access Token from environment variables.
 */

const ASANA_BASE = "https://app.asana.com/api/1.0";

function getToken(): string {
    const token = process.env.ASANA_PAT;
    if (!token) throw new Error("ASANA_PAT is not set in environment variables.");
    return token;
}

async function asanaFetch(path: string, options: RequestInit = {}) {
    const res = await fetch(`${ASANA_BASE}${path}`, {
        ...options,
        headers: {
            "Authorization": `Bearer ${getToken()}`,
            "Content-Type": "application/json",
            ...options.headers,
        },
        next: { revalidate: 0 }, // always fresh
    });

    if (!res.ok) {
        const body = await res.text();
        console.error(`Asana API Error [${res.status}]: ${body}`);
        throw new Error(`Asana API Error: ${res.status}`);
    }

    return res.json();
}

// ────────────────────────────────────────
// Types
// ────────────────────────────────────────

export interface AsanaTask {
    gid: string;
    name: string;
    completed: boolean;
    due_on: string | null;
    assignee: { gid: string; name: string } | null;
    tags: { gid: string; name: string; color: string }[];
    notes: string;
    created_at: string;
    modified_at: string;
    memberships: { section: { gid: string; name: string } }[];
    custom_fields?: any[];
    permalink_url: string;
}

export interface AsanaSection {
    gid: string;
    name: string;
}

export interface AsanaProject {
    gid: string;
    name: string;
    color: string;
}

// ────────────────────────────────────────
// Helpers
// ────────────────────────────────────────

export async function getWorkspaceProjects(workspaceGid: string): Promise<AsanaProject[]> {
    const { data } = await asanaFetch(
        `/workspaces/${workspaceGid}/projects?opt_fields=name,color&limit=50`
    );
    return data;
}

export async function getProjectSections(projectGid: string): Promise<AsanaSection[]> {
    const { data } = await asanaFetch(
        `/projects/${projectGid}/sections?opt_fields=name`
    );
    return data;
}

export async function getSectionTasks(sectionGid: string): Promise<AsanaTask[]> {
    const { data } = await asanaFetch(
        `/sections/${sectionGid}/tasks?opt_fields=name,completed,due_on,assignee.name,tags.name,tags.color,notes,created_at,modified_at,memberships.section.name,permalink_url&limit=100`
    );
    return data;
}

export async function getProjectTasks(projectGid: string): Promise<AsanaTask[]> {
    const { data } = await asanaFetch(
        `/projects/${projectGid}/tasks?opt_fields=name,completed,due_on,assignee.name,tags.name,tags.color,notes,created_at,modified_at,memberships.section.name,permalink_url&limit=100`
    );
    return data;
}

export async function createTask(projectGid: string, taskData: {
    name: string;
    notes?: string;
    due_on?: string;
    assignee?: string;
    section?: string;
}): Promise<AsanaTask> {
    const body: any = {
        data: {
            name: taskData.name,
            projects: [projectGid],
            notes: taskData.notes || "",
        },
    };
    if (taskData.due_on) body.data.due_on = taskData.due_on;
    if (taskData.assignee) body.data.assignee = taskData.assignee;

    const { data } = await asanaFetch(`/tasks`, {
        method: "POST",
        body: JSON.stringify(body),
    });

    // If section specified, move task into it
    if (taskData.section) {
        await asanaFetch(`/sections/${taskData.section}/addTask`, {
            method: "POST",
            body: JSON.stringify({ data: { task: data.gid } }),
        });
    }

    return data;
}

export async function completeTask(taskGid: string, completed: boolean = true) {
    const { data } = await asanaFetch(`/tasks/${taskGid}`, {
        method: "PUT",
        body: JSON.stringify({ data: { completed } }),
    });
    return data;
}

export async function getWorkspaceUsers(workspaceGid: string) {
    const { data } = await asanaFetch(
        `/workspaces/${workspaceGid}/users?opt_fields=name,email,photo.image_60x60`
    );
    return data;
}
