import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuroraHero from "@/components/AuroraHero";
import FeatureCardsRow from "@/components/FeatureCardsRow";
import {
  Search,
  AlertTriangle,
  FileText,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* ── HERO with AURORA BACKGROUND ── */}
      <AuroraHero />

      {/* Feature Cards Row with Direction-Aware Hover */}
      <FeatureCardsRow />

      {/* ── PROBLEM SECTION ── */}
      <section id="about" className="relative overflow-hidden py-24">
        {/* Decorative shapes */}
        <div className="absolute top-20 left-8 w-20 h-20 rounded-full bg-pink-100 animate-float-slow" />
        <div className="absolute top-40 right-16 w-8 h-8 rotate-45 border-2 border-purple-200 animate-float opacity-50" />
        <div className="absolute bottom-20 right-1/4 w-12 h-12 rounded-full bg-yellow-100 animate-float" />

        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-black gradient-text">
            Protecting Your Rights
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-500 text-lg">
            Bridging the gap between complex legal jargon and your understanding
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-3xl px-6">
          <div className="rounded-3xl bg-white p-8 md:p-12 shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-gray-100">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-6">
              The Problem We Solve
            </h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              Nobody reads{" "}
              <span className="font-semibold text-brand-pink">Terms of Service</span>,{" "}
              <span className="font-semibold text-brand-orange">rental agreements</span>, or{" "}
              <span className="font-semibold text-brand-purple">freelance contracts</span>.
              People blindly click &quot;I agree&quot; or sign, missing hidden fees,
              data-selling clauses, or terrible cancellation policies.
            </p>
            <p className="mt-4 text-gray-600 leading-relaxed text-lg">
              These documents are deliberately written in complex legal language to obscure
              predatory terms. ClauseGuard uses AI to read every line, flag the gotchas,
              and explain them in plain English so you actually know what you&apos;re agreeing to.
            </p>
          </div>
        </div>
      </section>

      {/* ── FEATURES / SOLUTION SECTION ── */}
      <section id="features" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-3xl md:text-5xl font-black text-center mb-16">
            Our Smart Solution
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                letter: "S",
                title: "Scan",
                desc: "Paste any contract text and our AI instantly parses every clause and condition",
                gradient: "from-pink-400 to-rose-500",
              },
              {
                letter: "A",
                title: "Analyze",
                desc: "Get a Risk Score out of 100 with detailed red flags highlighted and explained",
                gradient: "from-orange-400 to-red-500",
              },
              {
                letter: "P",
                title: "Protect",
                desc: "Understand exactly what you're agreeing to in casual, easy-to-understand language",
                gradient: "from-cyan-400 to-teal-500",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group rounded-2xl border border-gray-100 p-8 text-center hover:shadow-lg hover:border-gray-200 transition-all"
              >
                <div
                  className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white text-xl font-bold shadow-lg`}
                >
                  {item.letter}
                </div>
                <h3 className="mt-5 text-xl font-bold">{item.title}</h3>
                <p className="mt-3 text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS SECTION ── */}
      <section
        id="how-it-works"
        className="py-24 bg-gradient-to-br from-pink-50/80 via-white to-purple-50/80"
      >
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-6">How It Works</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-16">
            ClauseGuard uses advanced AI prompt engineering to act as your personal
            consumer protection lawyer — analyzing every clause in seconds.
          </p>

          <div className="space-y-8">
            {[
              {
                step: "01",
                title: "Paste Your Contract",
                desc: "Copy and paste the text from any Terms of Service, lease agreement, freelance contract, or privacy policy.",
                icon: FileText,
              },
              {
                step: "02",
                title: "AI Analyzes Every Clause",
                desc: "Our AI reads through the entire document, acting as an expert consumer protection lawyer looking for hidden gotchas.",
                icon: Search,
              },
              {
                step: "03",
                title: "Get Your Risk Report",
                desc: "Receive a Risk Score out of 100, a plain-English summary, and every red flag highlighted and explained.",
                icon: AlertTriangle,
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex flex-col md:flex-row items-center gap-6 rounded-2xl bg-white p-6 md:p-8 shadow-sm border border-gray-100 text-left"
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-pink to-brand-purple flex items-center justify-center">
                  <item.icon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <span className="text-xs font-bold text-brand-pink tracking-widest">
                    STEP {item.step}
                  </span>
                  <h3 className="text-xl font-bold mt-1">{item.title}</h3>
                  <p className="mt-2 text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION / STATS SECTION ── */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-3xl bg-gradient-to-br from-pink-50 via-purple-50/50 to-orange-50 p-10 md:p-16 text-center">
            <h2 className="text-3xl md:text-5xl font-black mb-6">Our Mission</h2>
            <p className="text-gray-600 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
              To democratize legal literacy by making contract analysis accessible to
              everyone. No more blindly clicking &quot;I agree&quot; — understand your
              rights before you sign, in language that actually makes sense.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            {[
              { stat: "99%", label: "Clause Detection" },
              { stat: "< 10s", label: "Analysis Time" },
              { stat: "100", label: "Risk Score Scale" },
              { stat: "Free", label: "To Use" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-3xl md:text-4xl font-black gradient-text">
                  {item.stat}
                </div>
                <div className="text-sm text-gray-500 mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="relative py-24 overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-10 left-1/4 w-12 h-12 rounded-full border-2 border-cyan-200 animate-float opacity-50" />
        <div className="absolute top-20 left-10 w-20 h-20 rounded-full border-2 border-yellow-200 animate-float-slow opacity-40" />
        <div className="absolute bottom-20 right-20 w-16 h-16 rotate-45 bg-purple-100/50 animate-float" />

        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-black">
            Start Protecting Yourself Today
          </h2>
          <p className="mt-4 text-gray-500 text-lg max-w-xl mx-auto">
            Don&apos;t sign another contract without knowing what you&apos;re agreeing to.
            Let AI be your legal guardian.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 rounded-full bg-brand-purple px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-200 hover:bg-violet-600 transition-all hover:shadow-xl hover:shadow-purple-300"
            >
              Analyze a Contract
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/#features"
              className="inline-flex items-center gap-2 rounded-full border-2 border-gray-200 px-8 py-3.5 text-sm font-bold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
