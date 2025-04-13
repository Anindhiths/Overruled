import { useState } from "react";

interface Case {
  id: number;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
}

interface CaseSelectionProps {
  onCaseSelect: (title: string, description: string) => void;
}

const SAMPLE_CASES: Case[] = [
  {
    id: 1,
    title: "The Corporate Espionage",
    description: "Defend a tech company executive accused of stealing trade secrets from a competitor.",
    difficulty: "medium",
  },
  {
    id: 2,
    title: "The Inheritance Dispute",
    description: "Represent a client in a complex family inheritance case involving a disputed will.",
    difficulty: "hard",
  },
  {
    id: 3,
    title: "The Environmental Protection",
    description: "Defend a small business owner against environmental violation charges.",
    difficulty: "easy",
  },
];

export const CaseSelection = ({ onCaseSelect }: CaseSelectionProps) => {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Select Your Case</h2>
        <p className="text-gray-600">Choose a case to defend and prove your legal expertise</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SAMPLE_CASES.map((case_) => (
          <div
            key={case_.id}
            className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
              selectedCase?.id === case_.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
            }`}
            onClick={() => setSelectedCase(case_)}
          >
            <h3 className="text-xl font-semibold mb-2">{case_.title}</h3>
            <p className="text-gray-600 mb-4">{case_.description}</p>
            <div className="flex justify-between items-center">
              <span className={`px-3 py-1 rounded-full text-sm ${
                case_.difficulty === "easy" ? "bg-green-100 text-green-800" :
                case_.difficulty === "medium" ? "bg-yellow-100 text-yellow-800" :
                "bg-red-100 text-red-800"
              }`}>
                {case_.difficulty.charAt(0).toUpperCase() + case_.difficulty.slice(1)}
              </span>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                onClick={() => onCaseSelect(case_.title, case_.description)}
              >
                Take Case
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 