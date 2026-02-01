import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden font-sans text-slate-200">
      {/* Background Decor */}
      <div className="blob bg-secondary w-[500px] h-[500px] top-[-200px] right-[-100px] opacity-10" />
      <div className="blob bg-primary w-[300px] h-[300px] bottom-[10%] left-[-100px] opacity-10" />

      <nav className="sticky top-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="container flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-black tracking-tight text-white">
              True<span className="text-primary">Serve</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 font-medium text-slate-300">
            <Link href="/restaurants" className="hover:text-primary transition-colors">Order Food</Link>
            <Link href="/driver" className="hover:text-primary transition-colors">Become a Driver</Link>
            <Link href="/merchant" className="hover:text-primary transition-colors">For Merchants</Link>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="btn btn-outline py-2 px-6 text-sm border-white/20 text-white hover:bg-white/10 hover:text-white">Log in</Link>
            <Link href="/restaurants" className="btn btn-primary py-2 px-6 text-sm shadow-none hover:shadow-lg hover:shadow-primary/20">Get Started</Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="container py-20 md:py-32 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left space-y-8 animate-fade-in">
            <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-bold tracking-wide uppercase mb-4 border border-primary/20">
              🚀 The Future of Delivery
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.1]">
              Craving meet <br />
              <span className="text-gradient">Lightning Speed.</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-lg mx-auto md:mx-0 leading-relaxed">
              Experience the freshest food delivery in Charlotte & Pineville.
              Zero hidden fees, transparent driver pay, and purely local flavor.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-orange-400 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                <form action="/restaurants" className="relative flex items-center bg-black/50 rounded-full p-2 pr-2 shadow-xl border border-white/10 min-w-[320px] backdrop-blur-md">
                  <span className="pl-4 pr-2 text-xl">📍</span>
                  <input
                    name="location"
                    placeholder="Enter your address..."
                    className="flex-1 bg-transparent border-none focus:outline-none text-white placeholder-slate-500 h-10"
                    required
                  />
                  <button type="submit" className="w-10 h-10 bg-primary text-black rounded-full flex items-center justify-center hover:bg-primary-hover transition-colors font-bold">
                    ➜
                  </button>
                </form>
              </div>
            </div>
            <p className="text-sm text-slate-500">Popular: <Link href="/restaurants?location=Charlotte" className="underline hover:text-primary">Charlotte</Link>, <Link href="/restaurants?location=Pineville" className="underline hover:text-primary">Pineville</Link></p>
          </div>

          <div className="flex-1 relative">
            <div className="relative z-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <img
                src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1000&auto=format&fit=crop"
                alt="Delicious Pizza"
                className="w-full h-auto object-cover rounded-[3rem] shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700 border border-white/5"
              />
            </div>
            {/* Floating Badge */}
            <div className="absolute top-10 -right-4 bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl shadow-xl z-20 animate-bounce border border-white/10" style={{ animationDuration: '3s' }}>
              <span className="text-2xl">🔥</span>
              <span className="font-bold text-white ml-2">Hot & Fresh</span>
            </div>
            <div className="absolute -bottom-6 -left-6 bg-slate-800/90 backdrop-blur-md p-6 rounded-2xl shadow-xl z-20 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 text-xl">⏱️</div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Avg Delivery</p>
                  <p className="text-lg font-bold text-white">24 Mins</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 relative">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-4xl font-bold mb-4 text-white">More than just delivery.</h2>
              <p className="text-slate-400 text-lg">We built TrueServe to fix everything wrong with food apps. Fair pay, real food, and honest prices.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="card hover:bg-white/5 transition-colors">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl shadow-sm mb-6 border border-white/10">💰</div>
                <h3 className="text-xl font-bold mb-3 text-white">Transparent Pricing</h3>
                <p className="text-slate-400 leading-relaxed">Know exactly where your money goes. We show the driver split on every single order.</p>
              </div>
              <div className="card hover:bg-white/5 transition-colors">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl shadow-sm mb-6 border border-white/10">🧭</div>
                <h3 className="text-xl font-bold mb-3 text-white">Live GPS Tracking</h3>
                <p className="text-slate-400 leading-relaxed">Watch your courier move in real-time. No more "arriving soon" guessing games.</p>
              </div>
              <div className="card hover:bg-white/5 transition-colors">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl shadow-sm mb-6 border border-white/10">🌱</div>
                <h3 className="text-xl font-bold mb-3 text-white">Local First</h3>
                <p className="text-slate-400 leading-relaxed">We partner exclusively with local gems, not just big chains. Support your neighborhood.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="container py-24">
          <div className="bg-gradient-to-br from-slate-900 to-black rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden border border-white/10">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1000')] bg-cover opacity-10 mix-blend-overlay"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">Ready to taste the difference?</h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/restaurants" className="btn btn-primary text-lg text-black px-8 py-4 shadow-lg shadow-primary/20">Order Now</Link>
                <Link href="/driver" className="btn bg-white/10 text-white hover:bg-white/20 border border-white/10 text-lg px-8 py-4 backdrop-blur-md">Drive for Us</Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-black/20 py-12 border-t border-white/5 mt-12">
        <div className="container flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} TrueServe Inc.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-primary">Privacy</Link>
            <Link href="#" className="hover:text-primary">Terms</Link>
            <Link href="/admin" className="hover:text-primary">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
