'use client';

import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';
import ProfileAvatar from '@/components/ProfileAvatar';
import Logo from '@/components/Logo';

export default function MobileUserSettings({ user, stats }: any) {
    return (
        <div className="lg:hidden noise-overlay font-dm-sans min-h-screen bg-[#0c0e13] flex flex-col">
            
            {/* LOGO HEADER */}
            <div className="flex items-center justify-between px-5 pt-8 pb-4">
                <Logo size="sm" />
                <div className="w-8 h-8 rounded-full bg-[#131720] border border-[#2a2f3a] flex items-center justify-center">
                    <span className="text-xs">⚙️</span>
                </div>
            </div>

            {/* SETTINGS TOP */}
            <div className="px-5 pt-8 pb-7 flex flex-col items-center border-b border-[#1c1f28]">
                <div className="w-24 h-24 bg-[#131720] border border-[#2a2f3a] rounded-[32px] p-1 flex items-center justify-center relative shadow-2xl mb-5">
                    <ProfileAvatar 
                        userId={user.id} 
                        initialName={user.name || ""} 
                        initialColor={user.avatarColor || "#E8A230"} 
                        initialUrl={user.avatarUrl} 
                        className="w-full h-full object-cover rounded-[28px]"
                    />
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#e8a230] rounded-xl border-4 border-[#0c0e13] flex items-center justify-center text-[14px]">✨</div>
                </div>
                <h1 className="font-barlow-cond text-3xl font-extrabold italic uppercase text-white leading-none mb-1.5">{user.name || 'TrueServe Elite'}</h1>
                <div className="text-[10px] font-bold text-[#555] uppercase tracking-[.25em]">Member Since · {new Date(user.createdAt || Date.now()).getFullYear()}</div>
            </div>

            <div className="flex-1 overflow-y-auto pb-32">
                {/* ACCOUNT STATS */}
                <div className="flex gap-2.5 px-5 pt-6 mb-8">
                    <div className="flex-1 bg-[#131720] border border-[#1c1f28] p-4 rounded-[20px] text-center">
                        <div className="text-[14px] font-bold text-white mb-0.5">Titanium</div>
                        <div className="text-[9px] font-bold text-[#e8a230] uppercase tracking-widest">Account Tier</div>
                    </div>
                    <div className="flex-1 bg-[#131720] border border-[#1c1f28] p-4 rounded-[20px] text-center">
                        <div className="text-[14px] font-bold text-white mb-0.5">$0.00</div>
                        <div className="text-[9px] font-bold text-[#3dd68c] uppercase tracking-widest">Credits</div>
                    </div>
                    <div className="flex-1 bg-[#131720] border border-[#1c1f28] p-4 rounded-[20px] text-center">
                        <div className="text-[14px] font-bold text-white mb-0.5">2,480</div>
                        <div className="text-[9px] font-bold text-[#555] uppercase tracking-widest">TS Points</div>
                    </div>
                </div>

                {/* SETTINGS LINKS */}
                <div className="px-5 space-y-2">
                    <div className="text-[11px] font-bold text-[#555] uppercase tracking-widest mb-4 px-1">Management Protocols</div>
                    {[
                        { label: 'Personal Information', sub: 'ID, Email, Secondary Mobile', icon: '👤', href: '/user/settings/info' },
                        { label: 'Password & Security', sub: 'Authentication Hooks & Encryption', icon: '🔐', href: '#' },
                        { label: 'Payment Methods', sub: 'Stripe Link & Encrypted Wallets', icon: '💳', href: '#' },
                        { label: 'Notifications', sub: 'Push & SMS Deployment Alerts', icon: '🔔', href: '#' },
                        { label: 'Privacy & Data', sub: 'Sector Permissions & Visibility', icon: '🛡️', href: '#' },
                    ].map((item, i) => (
                        <Link key={i} href={item.href} className="flex items-center gap-4 bg-[#0f1219] p-4 rounded-[24px] border border-[#1c1f28] active:scale-[0.98] transition-all">
                            <div className="w-11 h-11 bg-[#131720] border border-[#1c1f28] rounded-[14px] flex items-center justify-center text-[18px]">{item.icon}</div>
                            <div className="flex-1">
                                <div className="text-[14px] font-bold text-white">{item.label}</div>
                                <div className="text-[10px] text-[#555] font-medium leading-tight mt-0.5">{item.sub}</div>
                            </div>
                            <div className="text-[#333] text-[18px]">›</div>
                        </Link>
                    ))}
                </div>

                {/* REFERRAL BANNER */}
                <div className="mx-5 mt-8 mb-8 bg-gradient-to-br from-[#1a4a2a]/20 to-[#0c0e13] border border-[#1a4a2a]/30 p-6 rounded-[28px] relative overflow-hidden group active:scale-95 transition-all">
                    <div className="absolute top-0 right-0 p-4 text-4xl opacity-10 group-hover:opacity-20 transition-opacity">🎁</div>
                    <div className="relative z-10">
                        <h3 className="font-barlow-cond text-2xl font-extrabold italic uppercase text-[#3dd68c] leading-none mb-1.5">Sector Referral</h3>
                        <p className="text-[12px] text-[#aaa] font-medium leading-tight max-w-[180px]">Invite new operatives and harvest $15.00 yield for each.</p>
                        <button className="bg-[#3dd68c] text-black text-[10px] font-bold uppercase py-2 px-5 rounded-lg mt-4 shadow-[0_5px_15px_rgba(61,214,140,0.2)]">Generate Link</button>
                    </div>
                </div>

                {/* LOGOUT */}
                <div className="px-5 pb-12">
                    <LogoutButton className="w-full h-15 bg-[#111] border border-[#e24b4a]/10 text-[#555] font-dm-sans font-bold text-[13px] rounded-[100px] hover:text-[#e24b4a] transition-all" />
                </div>
            </div>

        </div>
    );
}
