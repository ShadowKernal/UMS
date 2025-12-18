"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import dynamic from "next/dynamic";
import { useRef } from "react";

const LottiePlayer = dynamic(() => import("@/components/ui/LottiePlayer"), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center text-slate-600 font-bold text-xs uppercase tracking-widest">Loading...</div>
});

// Premium Lottie URLs (Stable Food-themed) - PRESERVED AS REQUESTED
const ANIMATION_CHEF = "https://lottie.host/2f17e5d3-3047-4514-963e-9f9f72f256f2/vkYeLAxlCU.lottie";
const ANIMATION_HEALTHY_BOWL = "https://lottie.host/fff10634-ed3e-48e1-994c-b19da3c8c3d6/2BLrWoB9H9.lottie";
const ANIMATION_GROCERY_BAG = "https://lottie.host/983c6810-785a-4dba-859d-f962b8885123/Yylci9yqdJ.lottie";
const ANIMATION_COOKING_POT = "https://lottie.host/67035f29-a359-4d64-884d-2d075276e033/W65O0sI7Wc.json";

export default function HomePage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const starRotate = useTransform(scrollYProgress, [0, 1], [0, 180]);

  return (
    <main ref={containerRef} className="text-slate-900 overflow-x-hidden relative selection:bg-emerald-500/30">

      {/* GLOBAL AMBIENT BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none -z-50 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] rounded-full bg-emerald-100/40 blur-[120px] animate-pulse-slow" />
        <div className="absolute top-[20%] right-[-20%] w-[800px] h-[800px] rounded-full bg-emerald-50/60 blur-[100px] animate-float" />
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-slate-100/50 blur-[120px] animate-pulse-slow transition-opacity delay-1000" />
      </div>

      <header className="pt-32 pb-32 min-h-[90vh] flex items-center relative z-10 px-6">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-20 items-center">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-emerald-700 font-medium text-sm mb-8 border border-emerald-500/20 shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              The Future of Melt-In-Your-Mouth Meal Prep
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-bold leading-[0.95] mb-8 tracking-tighter text-slate-900">
              Eat like a <span className="text-gradient-emerald">King.</span> <br />
              <span className="text-slate-500 font-serif italic text-5xl md:text-7xl">without the chef.</span>
            </h1>

            <p className="text-xl text-slate-600 max-w-lg leading-relaxed mb-10 font-light">
              Experience the pinnacle of nutrition technology. AI-crafted menus, zero-waste shopping lists, and culinary guidance—elevated.
            </p>

            <div className="flex flex-col sm:flex-row gap-5">
              <Link href="/signup" className="group">
                <Button size="lg" className="w-full sm:w-auto h-16 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg shadow-[0_10px_30px_-5px_rgba(16,185,129,0.4)] transition-all hover:scale-105 active:scale-95 group-hover:shadow-[0_10px_40px_-5px_rgba(16,185,129,0.6)] border-none">
                  Start Your Journey
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-16 px-10 rounded-2xl border-slate-200 hover:bg-slate-50 text-slate-600 font-medium text-lg backdrop-blur-md transition-all hover:border-emerald-500/50">
                View Demo
              </Button>
            </div>

            <div className="mt-16 flex items-center gap-6 text-sm text-slate-500 font-medium">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 overflow-hidden relative shadow-sm">
                    <Image src={`https://i.pravatar.cc/100?u=${i + 20}`} alt="user" fill className="object-cover grayscale hover:grayscale-0 transition-all cursor-pointer" />
                  </div>
                ))}
              </div>
              <p>Trusted by <span className="text-slate-900 font-bold">50,000+</span> elites.</p>
            </div>
          </motion.div>

          {/* RIGHT SIDE GRAPHICS */}
          <motion.div
            style={{ y: y1 }}
            className="relative hidden lg:block"
          >
            {/* Abstract Decorations */}
            <motion.div style={{ rotate: starRotate }} className="absolute -top-20 -right-20 text-emerald-100 w-96 h-96 z-0">
              <svg viewBox="0 0 200 200" className="w-full h-full animate-pulse-slow">
                <path fill="currentColor" d="M45.7,-76.3C58.9,-69.3,69.1,-57.6,76.3,-44.6C83.5,-31.6,87.6,-17.3,86.6,-3.4C85.5,10.5,79.3,24,70.9,35.8C62.5,47.6,52,57.7,40.1,65.2C28.2,72.7,14.9,77.6,0.9,76C-13,74.5,-27,66.5,-39.8,59C-52.6,51.5,-64.1,44.5,-73.4,32.8C-82.7,21.1,-89.7,4.7,-88.4,-10.8C-87.1,-26.3,-77.5,-40.9,-65.4,-51.2C-53.3,-61.5,-38.7,-67.5,-23.8,-70.5C-8.9,-73.5,6.3,-73.5,20.6,-70.5" transform="translate(100 100)" />
              </svg>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="relative z-10 p-6 rounded-[2.5rem] glass-card border-none bg-gradient-to-br from-white/80 to-slate-50/50"
            >
              <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-24 h-64 bg-emerald-200/40 blur-[60px] rounded-full pointer-events-none" />

              {/* Main Dashboard Mockup */}
              <div className="relative overflow-hidden rounded-[2rem] bg-white border border-slate-100 shadow-2xl">
                {/* Fake UI Header */}
                <div className="h-14 border-b border-slate-100 flex items-center px-6 justify-between bg-slate-50/50">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-300" />
                    <div className="w-3 h-3 rounded-full bg-slate-300" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="h-2 w-24 rounded-full bg-slate-200" />
                </div>

                <div className="p-8 relative">
                  <div className="flex justify-between items-end mb-8">
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">This Week&apos;s Macro Goal</p>
                      <h3 className="text-3xl font-display font-medium text-slate-900">2,400 <span className="text-slate-400 text-lg">kcal</span></h3>
                    </div>
                    <div className="h-10 w-10 rounded-full border border-emerald-500/20 flex items-center justify-center text-emerald-500 bg-emerald-50">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { name: "Avocado Toast & Egg", kcal: "450", time: "10m", color: "bg-emerald-50 text-emerald-700" },
                      { name: "Grilled Salmon Poke", kcal: "620", time: "25m", color: "bg-emerald-50 text-emerald-700" },
                      { name: "Quinoa Power Bowl", kcal: "380", time: "15m", color: "bg-slate-50 text-slate-700" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center p-4 rounded-xl bg-white border border-slate-100 hover:border-emerald-500/30 hover:shadow-lg transition-all cursor-pointer group">
                        <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center font-bold`}>
                          {item.name[0]}
                        </div>
                        <div className="ml-4 flex-1">
                          <h4 className="text-sm font-medium text-slate-900 group-hover:text-emerald-600 transition-colors">{item.name}</h4>
                          <p className="text-xs text-slate-500">{item.kcal} kcal • {item.time}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:border-emerald-500/30 transition-all">
                          +
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chart Graphic Overlay */}
                  <div className="absolute top-1/2 right-4 -translate-y-1/2 w-px h-32 bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-12 top-20 w-48 shadow-2xl rounded-2xl overflow-hidden glass-card border-none z-20"
              >
                <div className="p-4 flex flex-col items-center text-center">
                  <div className="mb-2">
                    <LottiePlayer src={ANIMATION_COOKING_POT} className="w-20 h-20" />
                  </div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Status</div>
                  <div className="text-emerald-600 font-bold">Cooking Now</div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* BUILT FOR RESULTS section - High Importance */}
      <section className="py-32 relative z-10" id="results">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-6 text-slate-900">
              Built for <span className="text-gradient-emerald">Results.</span>
            </h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              We don&apos;t just plan meals. We engineer your nutrition for peak performance,
              wrapping strict science in a beautiful, seamless experience.
            </p>
          </motion.div>

          {/* Bento Grid Layout for Features */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="glass-card hover:glass-card-hover rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group bg-white"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/40 rounded-full blur-[80px] group-hover:bg-emerald-100/60 transition-all" />

              <div className="h-48 mb-6 relative z-10">
                <LottiePlayer src={ANIMATION_HEALTHY_BOWL} className="w-full h-full drop-shadow-xl" />
              </div>

              <h3 className="text-2xl font-display font-medium mb-4 text-slate-900">Custom Plans</h3>
              <p className="text-slate-500 leading-relaxed">
                Vegan, Keto, or Paleo? Our engine adapts instantly. Every macro calculated, every micronutrient tracked.
              </p>
            </motion.div>

            {/* Card 2 - Featured/Taller */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -10 }}
              className="glass-card hover:glass-card-hover rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group md:-mt-8 md:mb-8 border-t-4 border-t-emerald-500 bg-white"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-slate-50/50" />

              <div className="h-56 mb-8 relative z-10 scale-110">
                <LottiePlayer src={ANIMATION_GROCERY_BAG} className="w-full h-full" />
              </div>

              <h3 className="text-3xl font-display font-medium mb-4 text-slate-900">Smart Shopping</h3>
              <p className="text-slate-500 leading-relaxed text-lg">
                We organize your grocery run by aisle. In and out in 15 minutes. Or click &quot;Delivery&quot; and have it at your door.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -10 }}
              className="glass-card hover:glass-card-hover rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group bg-white"
            >
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-100 rounded-full blur-[80px] group-hover:bg-emerald-50 transition-all" />

              <div className="h-48 mb-6 relative z-10">
                <LottiePlayer src={ANIMATION_CHEF} className="w-full h-full" />
              </div>

              <h3 className="text-2xl font-display font-medium mb-4 text-slate-900">Batch Mode</h3>
              <p className="text-slate-500 leading-relaxed">
                Cook once, eat all week. We optimize your prep session to under 90 minutes with parallel cooking instructions.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-[3rem] overflow-hidden bg-emerald-900 border border-emerald-500/30 p-12 md:p-24 text-center"
          >
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">
                Ready to <span className="text-emerald-400">Upgrade</span> Your Life?
              </h2>
              <p className="text-lg text-emerald-100/60 mb-12 max-w-xl mx-auto">
                Join the ecosystem of high-performers who fuel their ambition with precision nutrition.
              </p>

              <Link href="/signup">
                <Button className="h-20 px-16 text-xl rounded-full bg-white text-emerald-900 hover:bg-emerald-50 font-bold transition-transform hover:-translate-y-1 shadow-[0_0_50px_rgba(255,255,255,0.2)] border-none">
                  Get Started Free
                </Button>
              </Link>
              <p className="mt-8 text-sm text-emerald-400/60 font-medium">No credit card required • Cancel anytime</p>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-50 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-600 p-2.5 rounded-xl shadow-lg shadow-emerald-200">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <span className="text-2xl font-bold text-slate-900 tracking-tight">PrepMaster</span>
            </div>
            <p className="text-slate-500 max-w-sm">
              The premium choice for automated meal planning. Designed for the modern professional.
            </p>
          </div>

          <div>
            <h4 className="text-slate-900 font-bold mb-6">Product</h4>
            <ul className="space-y-4 text-slate-500 text-sm">
              <li><a href="#" className="hover:text-emerald-600 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-emerald-600 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-emerald-600 transition-colors">API</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-slate-500 text-sm">
              <li><a href="#" className="hover:text-emerald-600 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-emerald-600 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-emerald-600 transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-200 flex flex-col md:row justify-between items-center gap-6">
          <div className="text-slate-500 text-sm">© 2025 PrepMaster Inc.</div>
          <div className="flex gap-6 text-slate-500 text-sm">
            <a href="#" className="hover:text-slate-900">Privacy</a>
            <a href="#" className="hover:text-slate-900">Terms</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
