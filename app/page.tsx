import Link from "next/link";
import HeroBackground from "@/components/HeroBackground";

export default function Home() {
  return (
    <div className="min-h-screen relative">
      <nav className="sticky top-0 z-50 backdrop-blur-lg border-b border-white/10 px-6 py-4">
        <div className="container flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <img src="/logo.png" alt="TrueServe Logo" className="w-10 h-10 rounded-full border border-white/10 group-hover:border-primary transition-all shadow-lg" />
            <span className="text-2xl font-black tracking-tighter">
              True<span className="text-gradient">Serve</span>
            </span>
          </Link>
          <div className="flex gap-4 hidden md:flex">
            <Link href="/driver" className="hover:text-primary transition-colors">Become a Driver</Link>
            <Link href="/merchant" className="hover:text-primary transition-colors">For Merchants</Link>
            <Link href="/restaurants" className="hover:text-primary transition-colors">Restaurants</Link>
            <Link href="/admin" className="hover:text-primary transition-colors">Admin Portal</Link>
          </div>
          {/* Mobile Menu Placeholder (Hamburger would go here, for now just hiding links on small screens to prevent overflow) */}
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="container py-32 text-center animate-fade-in">
          <h1 className="text-6xl font-extrabold mb-8 tracking-tight">
            Delivering <span className="text-gradient">Excellence</span> <br /> to Your Doorstep.
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            TrueServe connects you with the best local restaurants and empowers drivers with a revolutionary transparent pay model.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/restaurants" className="btn btn-primary">
              Order Food
            </Link>
            <Link href="/driver" className="btn btn-outline">
              Join as Driver
            </Link>
          </div>
        </section>

        {/* Customer Transparency Section */}
        <section className="container py-24 border-t border-white/5 bg-slate-900/40 relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-primary/10 blur-[120px] rounded-full -z-10" />

          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Transparent Pricing for <span className="text-gradient">Every Order.</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              No hidden "small order" fees. No "busy area" surcharges. Just honest delivery.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Membership Card */}
            <div className="card border-primary/20 bg-primary/5 p-8 relative group overflow-hidden">
              <div className="absolute top-4 right-4 bg-secondary/20 text-secondary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-secondary/20">Best Value</div>
              <h3 className="text-2xl font-bold mb-2">TrueServe Membership</h3>
              <p className="text-4xl font-black text-white mb-6">$9.99<span className="text-lg font-normal text-slate-500">/mo</span></p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="text-primary text-lg">✓</span>
                  <strong>$0 Delivery Fee</strong> on all orders
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="text-primary text-lg">✓</span>
                  Flat <strong>$1.49 Service Fee</strong>
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="text-primary text-lg">✓</span>
                  Exclusive Card-Linked Offers
                </li>
              </ul>
              <button className="w-full btn bg-primary text-white hover:bg-primary-hover font-bold border-none transition-all shadow-lg shadow-primary/20">Start 30-Day Free Trial</button>
            </div>

            {/* Non-Member Card */}
            <div className="card border-white/10 bg-white/5 p-8">
              <h3 className="text-2xl font-bold mb-2 text-slate-300">Guest Checkout</h3>
              <p className="text-4xl font-black text-slate-500 mb-6">Pay-as-you-go</p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-slate-400">
                  <span className="text-accent text-lg">✓</span>
                  <strong>$2.99 Base </strong> Delivery Fee
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-400">
                  <span className="text-accent text-lg">✓</span>
                  Add <strong>$0.60/mi </strong> precisely tracked
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-400">
                  <span className="text-accent text-lg">✓</span>
                  No recurring commitment
                </li>
              </ul>
              <button className="w-full btn btn-outline border-white/20 text-white hover:bg-white/5">Order as Guest</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/5 border-t-primary/20">
              <div className="text-2xl mb-4 p-2 bg-primary/10 w-fit rounded-lg">📍</div>
              <h4 className="font-bold mb-2">Real-time Tracking</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Watch your courier on the map with precise ETA updates and live in-app chat.</p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/5 border-t-secondary/20">
              <div className="text-2xl mb-4 p-2 bg-secondary/10 w-fit rounded-lg">💎</div>
              <h4 className="font-bold mb-2">Loyalty Points</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Earn points on every dollar spent. Redeem for free meals and partner bank offers.</p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/5 border-t-accent/20">
              <div className="text-2xl mb-4 p-2 bg-accent/10 w-fit rounded-lg">🛡️</div>
              <h4 className="font-bold mb-2">Zero Surcharges</h4>
              <p className="text-xs text-slate-500 leading-relaxed">We never charge extra for busy areas or small orders. Transparent from tap to table.</p>
            </div>
          </div>
        </section>

        <section className="container py-20 border-t border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/driver" className="card group">
              <h3 className="text-2xl mb-4 group-hover:text-primary transition-colors">Driver Portal</h3>
              <p className="text-slate-400 mb-4">
                Join our fleet with guaranteed hours and transparent pay. Choose your subscription tier and drive your way.
              </p>
              <span className="text-sm font-semibold text-primary">Learn More &rarr;</span>
            </Link>

            <Link href="/merchant" className="card group">
              <h3 className="text-2xl mb-4 group-hover:text-primary transition-colors">Merchant Portal</h3>
              <p className="text-slate-400 mb-4">
                Partner with us to reach more hungry customers. Low commissions and high visibility.
              </p>
              <span className="text-sm font-semibold text-primary">Partner Up &rarr;</span>
            </Link>

            <Link href="/restaurants" className="card group">
              <h3 className="text-2xl mb-4 group-hover:text-primary transition-colors">Find Restaurants</h3>
              <p className="text-slate-400 mb-4">
                Explore top-rated local eateries and order your favorites with just a few clicks.
              </p>
              <span className="text-sm font-semibold text-primary">Start Ordering &rarr;</span>
            </Link>

            <Link href="/admin" className="card group">
              <h3 className="text-2xl mb-4 group-hover:text-primary transition-colors">Admin Portal</h3>
              <p className="text-slate-400 mb-4">
                Access the administrative dashboard to manage orders, drivers, and platform analytics.
              </p>
              <span className="text-sm font-semibold text-primary">Access Portal &rarr;</span>
            </Link>
          </div>
        </section>

        {/* End of content */}
      </main>

      <footer className="border-t border-white/5 py-5 text-center text-slate-200">
        <p>&copy; {new Date().getFullYear()} TrueServe. All rights reserved.</p>
      </footer>
    </div >
  );
}
