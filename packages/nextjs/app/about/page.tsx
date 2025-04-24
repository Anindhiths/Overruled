import Link from "next/link";

export default function About() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">About Legal Battle Arena</h1>
      
      <div className="max-w-4xl mx-auto">
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Game Concept</h2>
          <p className="text-white mb-4">
            Legal Battle Arena is a blockchain-based game that puts you in the shoes of a lawyer defending clients in various legal cases. 
            The game combines the power of blockchain technology with AI-powered interactions to create an engaging and educational experience.
          </p>
          <p className="text-white">
            As a player, you&apos;ll be presented with different cases and must use your legal expertise to defend your clients. 
            You&apos;ll interact with an AI judge, opposing counsel, and witnesses through a chat-based interface, making arguments and presenting evidence to win your cases.
          </p>
        </section>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-2">1. Select a Case</h3>
              <p className="text-gray-700">
                Choose from a variety of cases with different difficulty levels and legal themes. Each case presents unique challenges and requires different strategies.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-2">2. Enter the Courtroom</h3>
              <p className="text-gray-700">
                Step into a virtual courtroom where you&apos;ll interact with an AI judge and opposing counsel. The courtroom environment is designed to mimic real legal proceedings.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-2">3. Present Your Case</h3>
              <p className="text-gray-700">
                Make arguments, present evidence, and cross-examine witnesses through a chat-based interface. The AI responds dynamically to your inputs, creating a realistic legal experience.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-2">4. Score Points</h3>
              <p className="text-gray-700">
                Earn points based on the strength of your arguments, the evidence you present, and your overall performance in the courtroom.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-2">5. Win the Case</h3>
              <p className="text-gray-700">
                Successfully defend your client by convincing the judge of their innocence or by reaching a favorable settlement.
              </p>
            </div>
          </div>
        </section>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Technology</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-2">Blockchain</h3>
              <p className="text-gray-700">
                The game uses blockchain technology to manage case creation, evidence submission, scoring, and game state progression. 
                This ensures transparency and immutability of game records.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-2">AI Integration</h3>
              <p className="text-gray-700">
                Powered by Groq&apos;s advanced AI models, the game features intelligent judge, opposing counsel, and witness interactions. 
                The AI adapts to your arguments and creates dynamic, engaging conversations.
              </p>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
          <p className="text-white mb-6">
            Ready to test your legal skills? Connect your wallet and start playing Legal Battle Arena today!
          </p>
          <div className="flex justify-center">
            <Link 
              href="/game" 
              className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Play Now
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
} 