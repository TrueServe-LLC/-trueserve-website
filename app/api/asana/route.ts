import { NextRequest, NextResponse } from "next/server";
import {
    getProjectSections,
    getProjectTasks,
    getSectionTasks,
    createTask,
    completeTask,
    getWorkspaceUsers,
} from "@/lib/asana";
import { getAuthSession } from "@/app/auth/actions";
import { isInternalStaff } from "@/lib/rbac";
import { cookies } from "next/headers";

const WORKSPACE_GID = process.env.ASANA_WORKSPACE_GID || "1213798855713288";
const PROJECT_GID = process.env.ASANA_PROJECT_GID || "1213802368265152";

async function isAuthorized() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const { isAuth, role } = await getAuthSession();
    return !!adminSession || (isAuth && isInternalStaff(role));
}

// GET: Fetch tasks, sections, or users
export async function GET(req: NextRequest) {
    if (!(await isAuthorized())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    try {
        switch (action) {
            case "sections": {
                const sections = await getProjectSections(PROJECT_GID);
                return NextResponse.json({ data: sections });
            }
            case "tasks": {
                const sectionGid = searchParams.get("section");
                const tasks = sectionGid
                    ? await getSectionTasks(sectionGid)
                    : await getProjectTasks(PROJECT_GID);
                return NextResponse.json({ data: tasks });
            }
            case "users": {
                const users = await getWorkspaceUsers(WORKSPACE_GID);
                return NextResponse.json({ data: users });
            }
            case "board": {
                // Fetch sections + tasks in one call for the board view
                const sections = await getProjectSections(PROJECT_GID);
                const tasksPerSection: Record<string, any[]> = {};
                await Promise.all(
                    sections.map(async (section) => {
                        const tasks = await getSectionTasks(section.gid);
                        tasksPerSection[section.gid] = tasks;
                    })
                );
                return NextResponse.json({ sections, tasksPerSection });
            }
            default:
                return NextResponse.json(
                    { error: "Unknown action. Use: sections, tasks, users, board" },
                    { status: 400 }
                );
        }
    } catch (e: any) {
        console.error("Asana API route error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST: Create or update tasks
export async function POST(req: NextRequest) {
    if (!(await isAuthorized())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { action } = body;

        switch (action) {
            case "create": {
                const { name, notes, due_on, assignee, section } = body;
                const task = await createTask(PROJECT_GID, {
                    name,
                    notes,
                    due_on,
                    assignee,
                    section,
                });
                return NextResponse.json({ data: task });
            }
            case "complete": {
                const { taskGid, completed } = body;
                const task = await completeTask(taskGid, completed ?? true);
                return NextResponse.json({ data: task });
            }
            default:
                return NextResponse.json(
                    { error: "Unknown action. Use: create, complete" },
                    { status: 400 }
                );
        }
    } catch (e: any) {
        console.error("Asana API route error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
