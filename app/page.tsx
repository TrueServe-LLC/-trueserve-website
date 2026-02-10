import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";
import LandingSearch from "@/components/LandingSearch";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden font-sans text-slate-200 bg-black">
      {/* Background Decor */}
      <div className="blob bg-secondary w-[500px] h-[500px] top-[-200px] right-[-100px] opacity-10" />
      <div className="blob bg-primary w-[300px] h-[300px] bottom-[10%] left-[-100px] opacity-10" />

      <nav className="sticky top-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="container flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <img src="/logo.png" alt="TrueServe Logo" className="w-10 h-10 rounded-full border border-white/10 group-hover:border-primary transition-all shadow-lg" />
            <span className="text-2xl font-black tracking-tight text-white">
              True<span className="text-primary">Serve</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 font-medium text-slate-300">
            <Link href="/restaurants" className="hover:text-primary transition-colors">Order Food</Link>
            <Link href="/driver" className="hover:text-primary transition-colors">Become a Driver</Link>
            <Link href="/merchant" className="hover:text-primary transition-colors">For Merchants</Link>
          </div>
          <div className="flex gap-2 md:gap-4">
            <Link href="/login" className="btn btn-outline !py-2 !px-3 md:!px-6 !text-xs md:!text-sm border-white/20 text-white hover:bg-white/10 hover:text-white whitespace-nowrap">Log in</Link>
            <Link href="/restaurants" className="btn btn-primary !py-2 !px-3 md:!px-6 !text-xs md:!text-sm shadow-none hover:shadow-lg hover:shadow-primary/20 whitespace-nowrap">Get Started</Link>
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
                <LandingSearch locations={[
                  { city: 'Charlotte', state: 'NC', lat: 35.2271, lng: -80.8431 },
                  { city: 'Pineville', state: 'NC', lat: 35.0833, lng: -80.8872 },
                  { city: 'Ramsey', state: 'MN', lat: 45.2611, lng: -93.4566 }
                ]} />
              </div>
            </div>
            <div className="mt-6 md:hidden">
              <Link href="/driver" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-primary transition-colors border border-white/10 px-4 py-2 rounded-full bg-white/5">
                🚗 Want to drive? <span className="text-primary underline decoration-primary/50 underline-offset-2">Join Field Team</span>
              </Link>
            </div>
          </div>

          <div className="flex-1 relative w-full">
            <div className="relative z-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <HeroCarousel />
            </div>
            {/* Floating Badge */}
            <div className="relative mt-6 mx-auto md:absolute md:top-10 md:-right-4 md:mt-0 md:mx-0 w-max bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl shadow-xl z-20 animate-bounce border border-white/10" style={{ animationDuration: '3s' }}>
              <span className="text-2xl">🔥</span>
              <span className="font-bold text-white ml-2">Hot & Fresh</span>
            </div>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-16">
          <div className="container text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-xl text-slate-300 leading-relaxed font-medium">
              "TrueServe is a driver-first delivery marketplace that pays
              couriers 25–40% more than competitors while lowering restaurant commissions and
              simplifying customer pricing. Our model focuses on fair earnings, transparent
              fees, and smarter logistics."
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 relative">
          <div className="container mx-auto px-6">

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
        <section className="container py-24 mb-24 md:mb-0">
          <div className="bg-gradient-to-br from-slate-900 to-black rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden border border-white/10">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1000')] bg-cover opacity-10 mix-blend-overlay"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">Ready to taste the difference?</h2>
              <div className="flex flex-col gap-6 sm:flex-row justify-center items-center">
                <Link href="/restaurants" className="btn btn-primary w-full sm:w-auto text-base md:text-lg text-black px-8 py-3 md:py-4 shadow-lg shadow-primary/20">Order Now</Link>

                <div className="w-full h-px bg-white/10 sm:hidden"></div>

                <h2 className="text-4xl font-bold text-white mb-2 sm:hidden">Ready to drive?</h2>
                <Link href="/driver" className="btn bg-white/10 w-full sm:w-auto text-white hover:bg-white/20 border border-white/10 text-base md:text-lg px-8 py-3 md:py-4 backdrop-blur-md">Drive for Us</Link>
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
