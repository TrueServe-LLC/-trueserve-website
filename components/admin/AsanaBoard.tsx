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
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3">
                        <span className="inline-flex w-9 h-9 bg-gradient-to-br from-[#F06A6A] to-[#6A67CE] rounded-xl items-center justify-center text-base shadow-lg shadow-purple-500/20">📋</span>
                        Asana Board
                        <span className="bg-primary/20 text-primary text-[10px] px-3 py-1 rounded-full uppercase font-black border border-primary/20">
                            {totalTasks} Tasks
                        </span>
                    </h2>
                    {loading && (
                        <span className="w-2 h-2 bg-primary rounded-full animate-ping" />
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Stats pills */}
                    <div className="flex gap-2">
                        <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase tracking-widest text-emerald-400">
                            ✓ {completedTasks} Done
                        </div>
                        {overdueTasks > 0 && (
                            <div className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full text-[9px] font-black uppercase tracking-widest text-red-400 animate-pulse">
                                ⚠ {overdueTasks} Overdue
                            </div>
                        )}
                    </div>

                    {/* Assignee filter */}
                    {allAssignees.length > 0 && (
                        <select
                            value={filterAssignee}
                            onChange={(e) => setFilterAssignee(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-[10px] font-bold text-slate-400 focus:outline-none focus:border-primary/50 appearance-none cursor-pointer"
                        >
                            <option value="all">All Members</option>
                            {allAssignees.map((a) => (
                                <option key={a.gid} value={a.gid}>{a.name}</option>
                            ))}
                        </select>
                    )}

                    {/* View toggles */}
                    <div className="flex bg-white/5 border border-white/10 rounded-full p-0.5">
                        <button
                            onClick={() => setViewMode("board")}
                            className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full transition-all ${viewMode === "board" ? "bg-primary/20 text-primary" : "text-slate-500 hover:text-white"}`}
                        >
                            Board
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full transition-all ${viewMode === "list" ? "bg-primary/20 text-primary" : "text-slate-500 hover:text-white"}`}
                        >
                            List
                        </button>
                    </div>

                    {/* Create Task */}
                    <button
                        onClick={() => setCreating(!creating)}
                        className="bg-primary hover:bg-primary/90 text-black py-2 px-4 rounded-full font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                    >
                        <span className="text-sm">+</span> New Task
                    </button>

                    {/* External Link */}
                    <a
                        href={`https://app.asana.com/0/${board.sections[0]?.gid ? "1213802368265152" : ""}/board`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-primary px-3 py-2 border border-white/10 rounded-full hover:border-primary/20 transition-all flex items-center gap-1.5"
                    >
                        Open in Asana ↗
                    </a>
                </div>
            </div>

            {/* Create Task Form */}
            {creating && (
                <div className="mb-6 bg-white/[0.03] border border-white/10 rounded-2xl p-6 animate-fade-in">
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <input
                                type="text"
                                value={newTaskName}
                                onChange={(e) => setNewTaskName(e.target.value)}
                                placeholder="Task name..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                                autoFocus
                            />
                            <select
                                value={newTaskSection}
                                onChange={(e) => setNewTaskSection(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-400 focus:outline-none focus:border-primary/50 appearance-none cursor-pointer min-w-[180px]"
                            >
                                <option value="">Select section...</option>
                                {board.sections.map((s) => (
                                    <option key={s.gid} value={s.gid}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <textarea
                            value={newTaskNotes}
                            onChange={(e) => setNewTaskNotes(e.target.value)}
                            placeholder="Add notes (optional)..."
                            rows={2}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-none"
                        />
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={submitting || !newTaskName.trim()}
                                className="bg-primary hover:bg-primary/90 text-black py-2 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? "Creating..." : "Create Task"}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setCreating(false); setNewTaskName(""); setNewTaskNotes(""); }}
                                className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white px-4 py-2 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Board View */}
            {viewMode === "board" && (
                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x snap-mandatory">
                    {board.sections.map((section) => {
                        const tasks = (board.tasksPerSection[section.gid] || [])
                            .filter(t => filterAssignee === "all" || t.assignee?.gid === filterAssignee);
                        const incompleteTasks = tasks.filter(t => !t.completed);
                        const doneTasks = tasks.filter(t => t.completed);

                        return (
                            <div
                                key={section.gid}
                                className="flex-shrink-0 w-[320px] snap-start bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all group"
                            >
                                {/* Section Header */}
                                <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-base">{getSectionIcon(section.name)}</span>
                                        <h3 className="text-[11px] font-black uppercase tracking-widest text-white">
                                            {section.name.replace(":", "")}
                                        </h3>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-600 bg-white/5 px-2 py-0.5 rounded-full">
                                        {incompleteTasks.length}
                                    </span>
                                </div>

                                {/* Tasks */}
                                <div className="p-3 space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                                    {incompleteTasks.map((task) => {
                                        const dueBadge = getDueBadge(task.due_on);
                                        const isExpanded = expandedTask === task.gid;
                                        return (
                                            <div
                                                key={task.gid}
                                                className={`p-3.5 bg-white/[0.03] border border-white/5 rounded-xl hover:border-white/15 hover:bg-white/[0.05] transition-all cursor-pointer group/task ${isExpanded ? "ring-1 ring-primary/20 border-primary/10" : ""}`}
                                                onClick={() => setExpandedTask(isExpanded ? null : task.gid)}
                                            >
                                                <div className="flex items-start gap-2.5">
                                                    {/* Checkbox */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleComplete(task.gid, true);
                                                        }}
                                                        disabled={completingTask === task.gid}
                                                        className={`mt-0.5 flex-shrink-0 w-[18px] h-[18px] rounded-full border-2 border-slate-600 hover:border-primary hover:bg-primary/10 transition-all flex items-center justify-center ${completingTask === task.gid ? "animate-spin border-primary" : ""}`}
                                                    >
                                                        {completingTask === task.gid && (
                                                            <span className="w-2 h-2 bg-primary rounded-full" />
                                                        )}
                                                    </button>

                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[12px] font-semibold text-white leading-snug line-clamp-2">
                                                            {task.name}
                                                        </p>

                                                        {/* Tags */}
                                                        {task.tags && task.tags.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                {task.tags.map((tag) => (
                                                                    <span
                                                                        key={tag.gid}
                                                                        className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border ${TAG_COLORS[tag.color] || TAG_COLORS.none}`}
                                                                    >
                                                                        {tag.name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Meta row */}
                                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                            {task.assignee && (
                                                                <span className="text-[9px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                                                                    {task.assignee.name.split(" ")[0]}
                                                                </span>
                                                            )}
                                                            {dueBadge && (
                                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${dueBadge.className}`}>
                                                                    {dueBadge.text}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Expanded details */}
                                                        {isExpanded && (
                                                            <div className="mt-3 pt-3 border-t border-white/5 space-y-2 animate-fade-in">
                                                                {task.notes && (
                                                                    <p className="text-[11px] text-slate-400 leading-relaxed whitespace-pre-line line-clamp-5">
                                                                        {task.notes}
                                                                    </p>
                                                                )}
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-[9px] text-slate-600">
                                                                        Updated {getRelativeTime(task.modified_at)}
                                                                    </span>
                                                                    <a
                                                                        href={task.permalink_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-[9px] font-bold text-primary hover:text-primary/80 transition-colors"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        Open in Asana ↗
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Completed Tasks (collapsed) */}
                                    {doneTasks.length > 0 && (
                                        <details className="mt-2">
                                            <summary className="text-[9px] font-black uppercase tracking-widest text-slate-600 cursor-pointer hover:text-slate-400 transition-colors px-1 py-2 select-none">
                                                {doneTasks.length} completed
                                            </summary>
                                            <div className="space-y-1.5 mt-1">
                                                {doneTasks.map((task) => (
                                                    <div
                                                        key={task.gid}
                                                        className="p-2.5 bg-white/[0.01] border border-white/[0.03] rounded-lg flex items-start gap-2 opacity-50"
                                                    >
                                                        <button
                                                            onClick={() => handleComplete(task.gid, false)}
                                                            className="mt-0.5 flex-shrink-0 w-[16px] h-[16px] rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center"
                                                        >
                                                            <span className="text-[8px] text-primary">✓</span>
                                                        </button>
                                                        <p className="text-[11px] text-slate-600 line-through line-clamp-1">
                                                            {task.name}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </details>
                                    )}

                                    {tasks.length === 0 && (
                                        <div className="py-8 text-center opacity-30">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">No tasks</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
                <div className="card overflow-hidden border-white/5 bg-black/40">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 w-8" />
                                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Task</th>
                                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Section</th>
                                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Assignee</th>
                                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Due</th>
                                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Tags</th>
                                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Link</th>
                            </tr>
                        </thead>
                        <tbody>
                            {board.sections.flatMap((section) =>
                                (board.tasksPerSection[section.gid] || [])
                                    .filter(t => !t.completed)
                                    .filter(t => filterAssignee === "all" || t.assignee?.gid === filterAssignee)
                                    .map((task) => {
                                        const dueBadge = getDueBadge(task.due_on);
                                        return (
                                            <tr key={task.gid} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                                <td className="px-5 py-3">
                                                    <button
                                                        onClick={() => handleComplete(task.gid, true)}
                                                        disabled={completingTask === task.gid}
                                                        className={`w-4 h-4 rounded-full border-2 border-slate-600 hover:border-primary hover:bg-primary/10 transition-all ${completingTask === task.gid ? "animate-spin border-primary" : ""}`}
                                                    />
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className="text-xs font-semibold text-white">{task.name}</span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-1 rounded-full border border-white/5">
                                                        {getSectionIcon(section.name)} {section.name.replace(":", "")}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className="text-[10px] text-slate-500 font-bold">
                                                        {task.assignee?.name || "—"}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    {dueBadge ? (
                                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${dueBadge.className}`}>
                                                            {dueBadge.text}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-600">—</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="flex gap-1 flex-wrap">
                                                        {(task.tags || []).map((tag) => (
                                                            <span
                                                                key={tag.gid}
                                                                className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border ${TAG_COLORS[tag.color] || TAG_COLORS.none}`}
                                                            >
                                                                {tag.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    <a
                                                        href={task.permalink_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[9px] font-bold text-primary hover:text-primary/80 transition-colors"
                                                    >
                                                        Open ↗
                                                    </a>
                                                </td>
                                            </tr>
                                        );
                                    })
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
