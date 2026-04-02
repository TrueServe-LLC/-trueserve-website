"use client";

import { useState, useEffect, useCallback } from "react";

interface AsanaTask {
    gid: string;
    name: string;
    completed: boolean;
    due_on: string | null;
    assignee: { gid: string; name: string } | null;
    tags: { gid: string; name: string; color: string }[];
    notes: string;
    permalink_url: string;
    created_at: string;
    modified_at: string;
}

interface AsanaSection {
    gid: string;
    name: string;
}

interface BoardData {
    sections: AsanaSection[];
    tasksPerSection: Record<string, AsanaTask[]>;
}

const TAG_COLORS: Record<string, string> = {
    "dark-green": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    "dark-blue": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "dark-red": "bg-red-500/20 text-red-400 border-red-500/30",
    "dark-orange": "bg-orange-500/20 text-orange-400 border-orange-500/30",
    "dark-purple": "bg-purple-500/20 text-purple-400 border-purple-500/30",
    "dark-pink": "bg-pink-500/20 text-pink-400 border-pink-500/30",
    "dark-teal": "bg-teal-500/20 text-teal-400 border-teal-500/30",
    "dark-warm-gray": "bg-stone-500/20 text-stone-400 border-stone-500/30",
    "light-green": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    "light-blue": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "light-red": "bg-red-500/20 text-red-400 border-red-500/30",
    "light-orange": "bg-orange-500/20 text-orange-400 border-orange-500/30",
    "light-purple": "bg-purple-500/20 text-purple-400 border-purple-500/30",
    "light-pink": "bg-pink-500/20 text-pink-400 border-pink-500/30",
    "none": "bg-white/10 text-slate-400 border-white/20",
};

const SECTION_ICONS: Record<string, string> = {
    "backlog": "📋",
    "to do": "📝",
    "in progress": "🔄",
    "in review": "🔍",
    "done": "✅",
    "blocked": "🚫",
    "qa": "🧪",
    "ready for qa": "🧪",
    "ready for deploy": "🚀",
    "deployed": "🟢",
};

function getSectionIcon(name: string): string {
    const lower = name.toLowerCase().replace(":", "").trim();
    for (const [key, icon] of Object.entries(SECTION_ICONS)) {
        if (lower.includes(key)) return icon;
    }
    return "📌";
}

function getRelativeTime(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

function getDueBadge(dueOn: string | null): { text: string; className: string } | null {
    if (!dueOn) return null;
    const now = new Date();
    const due = new Date(dueOn + "T23:59:59");
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `${Math.abs(diffDays)}d overdue`, className: "bg-red-500/20 text-red-400 border-red-500/30" };
    if (diffDays === 0) return { text: "Due today", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
    if (diffDays <= 2) return { text: `Due in ${diffDays}d`, className: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
    return { text: due.toLocaleDateString("en-US", { month: "short", day: "numeric" }), className: "bg-white/5 text-slate-500 border-white/10" };
}

export default function AsanaBoard() {
    const [board, setBoard] = useState<BoardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    const [newTaskName, setNewTaskName] = useState("");
    const [newTaskSection, setNewTaskSection] = useState("");
    const [newTaskNotes, setNewTaskNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [completingTask, setCompletingTask] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"board" | "list">("board");
    const [filterAssignee, setFilterAssignee] = useState<string>("all");
    const [expandedTask, setExpandedTask] = useState<string | null>(null);

    const fetchBoard = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/asana?action=board");
            if (!res.ok) {
                const errBody = await res.json();
                throw new Error(errBody.error || "Failed to fetch board");
            }
            const data = await res.json();
            setBoard(data);
            setError(null);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBoard();
        // Poll every 60s
        const interval = setInterval(fetchBoard, 60000);
        return () => clearInterval(interval);
    }, [fetchBoard]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskName.trim()) return;
        setSubmitting(true);
        try {
            await fetch("/api/asana", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "create",
                    name: newTaskName.trim(),
                    notes: newTaskNotes.trim(),
                    section: newTaskSection || undefined,
                }),
            });
            setNewTaskName("");
            setNewTaskNotes("");
            setNewTaskSection("");
            setCreating(false);
            fetchBoard();
        } catch {
            // silent
        } finally {
            setSubmitting(false);
        }
    };

    const handleComplete = async (taskGid: string, completed: boolean) => {
        setCompletingTask(taskGid);
        try {
            await fetch("/api/asana", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "complete", taskGid, completed }),
            });
            fetchBoard();
        } catch {
            // silent
        } finally {
            setCompletingTask(null);
        }
    };

    // Get all unique assignees for filter
    const allAssignees = board
        ? [...new Map(
            Object.values(board.tasksPerSection)
                .flat()
                .filter((t) => t.assignee)
                .map((t) => [t.assignee!.gid, t.assignee!.name])
        ).entries()].map(([gid, name]) => ({ gid, name }))
        : [];

    // Stats
    const totalTasks = board ? Object.values(board.tasksPerSection).flat().length : 0;
    const completedTasks = board ? Object.values(board.tasksPerSection).flat().filter(t => t.completed).length : 0;
    const overdueTasks = board ? Object.values(board.tasksPerSection).flat().filter(t => {
        if (!t.due_on || t.completed) return false;
        return new Date(t.due_on) < new Date();
    }).length : 0;

    if (loading && !board) {
        return (
            <section className="mb-16">
                <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                        <span className="inline-block w-8 h-8 bg-gradient-to-br from-[#F06A6A] to-[#6A67CE] rounded-lg flex items-center justify-center text-sm">📋</span>
                        Asana Board
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 animate-pulse">
                            <div className="h-4 bg-white/10 rounded-full w-24 mb-6" />
                            <div className="space-y-3">
                                <div className="h-16 bg-white/5 rounded-xl" />
                                <div className="h-16 bg-white/5 rounded-xl" />
                                <div className="h-16 bg-white/5 rounded-xl" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="mb-16">
                <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                        <span className="inline-block w-8 h-8 bg-gradient-to-br from-[#F06A6A] to-[#6A67CE] rounded-lg flex items-center justify-center text-sm">📋</span>
                        Asana Board
                    </h2>
                </div>
                <div className="card p-8 text-center border-red-500/20 bg-red-500/5">
                    <p className="text-red-400 text-sm font-bold mb-2">Failed to load Asana board</p>
                    <p className="text-slate-500 text-xs mb-4">{error}</p>
                    <button
                        onClick={fetchBoard}
                        className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all"
                    >
                        Retry
                    </button>
                </div>
            </section>
        );
    }

    if (!board) return null;

    return (
        <section className="mb-16">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-3xl font-bold flex items-center gap-3 italic">
                      Asana <span className="text-primary not-italic">Board</span>
                  </h2>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Task management and operational oversight</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex gap-4 mr-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{completedTasks} DONE</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-500 rounded-full pulse"></span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{overdueTasks} OVERDUE</span>
                        </div>
                    </div>

                    <div className="flex bg-white/5 border border-white/10 rounded-lg p-0.5">
                        <button onClick={() => setViewMode("board")} className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-md transition-all ${viewMode === "board" ? "bg-primary text-black" : "text-slate-500 hover:text-white"}`}>Board</button>
                        <button onClick={() => setViewMode("list")} className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-primary text-black" : "text-slate-500 hover:text-white"}`}>List</button>
                    </div>

                    <button onClick={() => setCreating(!creating)} className="bg-primary hover:bg-primary/90 text-black py-2 px-5 rounded-lg font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2">+ New Task</button>

                    <a href={`https://app.asana.com/0/1213802368265152/board`} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white px-4 py-2 border border-white/10 rounded-lg hover:border-white/20 transition-all">Open in Asana ↗</a>
                </div>
            </div>

            {creating && (
                <div className="mb-8 bg-white/[0.02] border border-white/5 rounded-2xl p-6 animate-fade-in">
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <input
                                type="text"
                                value={newTaskName}
                                onChange={(e) => setNewTaskName(e.target.value)}
                                placeholder="Task name..."
                                className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-primary/50"
                                autoFocus
                            />
                            <select
                                value={newTaskSection}
                                onChange={(e) => setNewTaskSection(e.target.value)}
                                className="bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-500 focus:outline-none"
                                aria-label="Select Task Section"
                            >
                                <option value="">Select section...</option>
                                {board.sections.map((s) => (
                                    <option key={s.gid} value={s.gid}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-3">
                            <button type="submit" disabled={submitting || !newTaskName.trim()} className="bg-primary text-black py-2 px-6 rounded-lg font-black uppercase tracking-widest text-[10px] disabled:opacity-50">
                                {submitting ? "..." : "Create Task"}
                            </button>
                            <button type="button" onClick={() => setCreating(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-white px-4 py-2">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="flex gap-px overflow-x-auto pb-4 bg-white/5 border border-white/5">
                {board.sections.map((section) => {
                    const tasks = (board.tasksPerSection[section.gid] || [])
                        .filter(t => filterAssignee === "all" || t.assignee?.gid === filterAssignee);
                    const incompleteTasks = tasks.filter(t => !t.completed);

                    return (
                        <div key={section.gid} className="flex-shrink-0 w-[340px] bg-[#0c0e13] min-h-[400px]">
                            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-primary text-[10px]">{getSectionIcon(section.name)}</span>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic">
                                        {section.name.replace(":", "")}
                                    </h3>
                                </div>
                                <span className="text-[9px] font-black text-slate-700">{incompleteTasks.length}</span>
                            </div>

                            <div className="p-3 space-y-1.5">
                                {incompleteTasks.map((task) => {
                                    const dueBadge = getDueBadge(task.due_on);
                                    return (
                                        <div key={task.gid} className="p-4 bg-white/[0.02] border border-white/5 rounded-lg hover:border-white/10 transition-all cursor-pointer group">
                                            <div className="flex flex-col gap-2">
                                                <p className="text-[12px] font-bold text-slate-200 tracking-tight leading-snug group-hover:text-white transition-colors">
                                                    {task.name}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                      <span className="text-[9px] font-black uppercase text-slate-600">{task.assignee?.name || 'Unassigned'}</span>
                                                      {dueBadge && (
                                                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${dueBadge.className}`}>
                                                              {dueBadge.text}
                                                          </span>
                                                      )}
                                                    </div>
                                                    <button onClick={(e) => { e.stopPropagation(); handleComplete(task.gid, true); }} className="w-4 h-4 rounded border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 flex items-center justify-center transition-all">
                                                        <span className="text-[8px] text-white/0 group-hover:text-white/20">✓</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {incompleteTasks.length === 0 && (
                                    <div className="py-20 text-center opacity-20">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">NO TASKS</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
