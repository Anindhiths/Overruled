"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-blue-800 mb-6">
          Overruled!
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Step into the courtroom and prove your legal expertise in this blockchain-based game.
          Defend clients, present evidence, and outmaneuver your opponents with AI-powered interactions.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <Link 
            href="/game" 
            className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Play Now
          </Link>
          <Link 
            href="/about" 
            className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Learn More
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-4xl mb-4">⚖️</div>
            <h3 className="text-xl font-bold mb-2">Realistic Courtroom</h3>
            <p className="text-gray-600">
              Experience the thrill of a real courtroom with AI-powered judge and opposing counsel.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-bold mb-2">AI-Powered Interactions</h3>
            <p className="text-gray-600">
              Engage in dynamic conversations with intelligent AI that adapts to your arguments.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-4xl mb-4">🔗</div>
            <h3 className="text-xl font-bold mb-2">Blockchain Technology</h3>
            <p className="text-gray-600">
              Leverage the power of blockchain for transparent scoring and achievements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
