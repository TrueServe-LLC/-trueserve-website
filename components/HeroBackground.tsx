"use client";

export default function FoodScroll() {
    const images = [
        "/hero-pizza.png",
        "/hero-burger.png",
        "/hero-sushi.png",
        "/hero-pizza.png",
        "/hero-burger.png",
        "/hero-sushi.png"
    ];

    return (
        <div className="w-full overflow-hidden py-4 bg-slate-900/20 border-t border-white/5">
            <div className="container px-6">
                <p className="text-center text-[9px] text-slate-500 uppercase tracking-[0.4em] mb-3 opacity-50">Our Categories</p>
                <div className="flex justify-center">
                    <div className="relative w-full max-w-2xl overflow-hidden">
                        <div className="animate-scroll flex gap-3">
                            {/* Double the images to create infinite loop effect */}
                            {[...images, ...images].map((src, index) => (
                                <div
                                    key={index}
                                    className="w-8 h-8 rounded-lg overflow-hidden shadow-sm border border-white/5 shrink-0 bg-slate-800"
                                >
                                    <img
                                        src={src}
                                        alt="Food item"
                                        className="w-full h-full object-cover grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                                    />
                                </div>
                            ))}
                        </div>
                        {/* Gradient Fades for the edges */}
                        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-slate-950 to-transparent z-10" />
                        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-slate-950 to-transparent z-10" />
                    </div>
                </div>
            </div>
        </div>
    );
}
