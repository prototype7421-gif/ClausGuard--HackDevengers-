import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnalyzerClient from "@/components/AnalyzerClient";

export const metadata = {
  title: "Analyze Contract — ClauseGuard",
  description: "Paste your contract or Terms of Service text and get an instant risk analysis.",
};

export default function AnalyzePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <AnalyzerClient />
      </main>
      <Footer />
    </>
  );
}
