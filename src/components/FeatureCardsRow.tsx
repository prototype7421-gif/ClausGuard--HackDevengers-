"use client";

import { FileText, Shield, AlertTriangle, Eye } from "lucide-react";
import DirectionAwareCard from "./DirectionAwareCard";

const cards = [
  {
    icon: FileText,
    label: "TERMS OF SERVICE",
    description: "Decode the fine print that apps hide in their ToS agreements",
    imageSrc: "/images/terms-of-service.jpg",
    gradientColor: "from-pink-600/95 to-rose-500/95",
  },
  {
    icon: Shield,
    label: "RENTAL AGREEMENTS",
    description: "Find hidden fees and unfair clauses in your lease before signing",
    imageSrc: "/images/rental-agreements.jpg",
    gradientColor: "from-purple-600/95 to-violet-500/95",
  },
  {
    icon: AlertTriangle,
    label: "FREELANCE CONTRACTS",
    description: "Protect your work, payments, and IP rights in client contracts",
    imageSrc: "/images/freelance-contracts.jpg",
    gradientColor: "from-orange-600/95 to-amber-500/95",
  },
  {
    icon: Eye,
    label: "PRIVACY POLICIES",
    description: "See exactly how companies collect, use, and sell your data",
    imageSrc: "/images/privacy.jpg",
    gradientColor: "from-cyan-600/95 to-teal-500/95",
  },
];

export default function FeatureCardsRow() {
  return (
    <section className="bg-gray-950 py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {cards.map((card) => (
            <DirectionAwareCard
              key={card.label}
              imageSrc={card.imageSrc}
              label={card.label}
              description={card.description}
              icon={card.icon}
              gradientColor={card.gradientColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
