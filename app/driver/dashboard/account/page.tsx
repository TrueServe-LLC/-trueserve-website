export default function DriverAccount() {
    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in-up">
            <h1 className="text-3xl font-bold">Account</h1>

            <div className="card bg-white/5 border-white/10 p-6 flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center text-3xl">👤</div>
                <div>
                    <h2 className="text-xl font-bold">John Doe</h2>
                    <p className="text-slate-400">Since Jan 2024</p>
                    <div className="flex gap-2 mt-2">
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded uppercase">Active</span>
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded uppercase">Gold Tier</span>
                    </div>
                </div>
                <button className="ml-auto btn btn-outline btn-sm border-white/20">Edit</button>
            </div>

            <section>
                <h3 className="text-lg font-bold mb-4 uppercase tracking-wider text-slate-500 text-xs">Personal Details</h3>
                <div className="card bg-white/5 border-white/10 p-0 overflow-hidden divide-y divide-white/5">
                    <div className="p-4 flex justify-between items-center hover:bg-white/[0.02]">
                        <span className="text-slate-400 text-sm">Email</span>
                        <span className="text-white">john.doe@example.com</span>
                    </div>
                    <div className="p-4 flex justify-between items-center hover:bg-white/[0.02]">
                        <span className="text-slate-400 text-sm">Phone</span>
                        <span className="text-white">(555) 123-4567</span>
                    </div>
                    <div className="p-4 flex justify-between items-center hover:bg-white/[0.02]">
                        <span className="text-slate-400 text-sm">Address</span>
                        <span className="text-white text-right">123 Main St,<br />Charlotte, NC 28202</span>
                    </div>
                </div>
            </section>

            <section>
                <h3 className="text-lg font-bold mb-4 uppercase tracking-wider text-slate-500 text-xs">Vehicle & Documents</h3>
                <div className="card bg-white/5 border-white/10 p-0 overflow-hidden divide-y divide-white/5">
                    <div className="p-4 flex justify-between items-center hover:bg-white/[0.02]">
                        <div>
                            <p className="text-white font-semibold">2020 Toyota Camry</p>
                            <p className="text-xs text-slate-500">Silver • ABC-1234</p>
                        </div>
                        <span className="text-emerald-400 text-xs font-bold uppercase">Approved</span>
                    </div>
                    <div className="p-4 flex justify-between items-center hover:bg-white/[0.02]">
                        <div>
                            <p className="text-white font-semibold">Driver's License</p>
                            <p className="text-xs text-slate-500">Exp: 05/2028</p>
                        </div>
                        <span className="text-emerald-400 text-xs font-bold uppercase">Valid</span>
                    </div>
                    <div className="p-4 flex justify-between items-center hover:bg-white/[0.02]">
                        <div>
                            <p className="text-white font-semibold">Insurance</p>
                            <p className="text-xs text-slate-500">Exp: 12/2026</p>
                        </div>
                        <button className="text-red-400 text-xs font-bold uppercase hover:underline">Update Needed Soon</button>
                    </div>
                </div>
            </section>

            <button className="w-full btn btn-outline border-red-500/20 text-red-500 hover:bg-red-500/10 py-4">Sign Out</button>
        </div>
    );
}
