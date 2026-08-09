import { Shield } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-brand-pink" />
              <span className="text-lg font-extrabold tracking-tight">
                CLAUSE<span className="text-brand-pink">GUARD</span>
              </span>
            </Link>
            <p className="mt-4 text-gray-500 text-sm leading-relaxed max-w-xs">
              AI-powered contract analysis that protects your rights. Understand
              what you&apos;re signing before it&apos;s too late.
            </p>
            <div className="mt-6 flex gap-3">
              {["𝕏", "◉", "▷"].map((icon, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors cursor-pointer text-sm"
                >
                  {icon}
                </div>
              ))}
            </div>
          </div>

          {/* Document Types */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Supported Documents</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="hover:text-gray-700 transition-colors cursor-pointer">
                Terms of Service
              </li>
              <li className="hover:text-gray-700 transition-colors cursor-pointer">
                Privacy Policies
              </li>
              <li className="hover:text-gray-700 transition-colors cursor-pointer">
                Rental Agreements
              </li>
              <li className="hover:text-gray-700 transition-colors cursor-pointer">
                Freelance Contracts
              </li>
              <li className="hover:text-gray-700 transition-colors cursor-pointer">
                Employment Contracts
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li>
                <Link href="/#features" className="hover:text-gray-700 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-gray-700 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/#about" className="hover:text-gray-700 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/analyze" className="hover:text-gray-700 transition-colors">
                  Analyze Contract
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © 2025 ClauseGuard. Protecting your rights, one clause at a time.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-gray-400">AI Analysis Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
