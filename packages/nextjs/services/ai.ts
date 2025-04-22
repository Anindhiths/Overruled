interface AIResponse {
  content: string;
  role: string;
}

export class AIService {
  private static instance: AIService;
  private apiKey: string;

  private constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY || "";
    if (!this.apiKey) {
      console.warn("GROQ API key is not set. Please set NEXT_PUBLIC_GROQ_API_KEY in your environment variables.");
    }
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async generateJudgeResponse(context: string): Promise<string> {
    const prompt = `You are an AI judge in a legal game. Provide a brief, concise response (1-2 sentences) that maintains judicial decorum and guides the proceedings. Ensure your response is grammatically perfect with proper punctuation and sentence structure.

    IMPORTANT: Always check spelling carefully! Never use "Yur" instead of "Your". Always spell words correctly, especially common words like "Your Honor", "court", "evidence", etc.
    
    Context: ${context}
    
    Respond as judge:`;

    try {
      const response = await this.callGroqAPI(prompt);
      return this.spellCheckResponse(response);
    } catch (error) {
      console.error("Error generating judge response:", error);
      return "The court will take that under advisement.";
    }
  }

  async generateOpponentResponse(context: string): Promise<string> {
    const prompt = `You are an AI opposing counsel in a legal game. Provide a brief, concise response (1-2 sentences) that challenges the player's arguments while maintaining professionalism. Ensure your response is grammatically perfect with proper punctuation and sentence structure.
    
    IMPORTANT: Always check spelling carefully! Never use "Yur" instead of "Your". Always spell words correctly, especially common words like "Your Honor", "court", "evidence", "prosecution", etc.
    
    Context: ${context}
    
    Respond as opposing counsel:`;

    try {
      const response = await this.callGroqAPI(prompt);
      return this.spellCheckResponse(response);
    } catch (error) {
      console.error("Error generating opponent response:", error);
      return "I object to that line of questioning, Your Honor.";
    }
  }

  async generateWitnessResponse(context: string, witnessRole: string): Promise<string> {
    const prompt = `You are a ${witnessRole} witness in a legal game. Provide a brief, concise response (1-2 sentences) that stays in character and provides relevant testimony. Ensure your response is grammatically perfect with proper punctuation and sentence structure.
    
    IMPORTANT: Always check spelling carefully! Never use "Yur" instead of "Your". Always spell words correctly, especially common words like "Your Honor", "court", "evidence", etc.
    
    Context: ${context}
    
    Respond as the witness:`;

    try {
      const response = await this.callGroqAPI(prompt);
      return this.spellCheckResponse(response);
    } catch (error) {
      console.error("Error generating witness response:", error);
      return "I don't recall, Your Honor.";
    }
  }

  // Helper method to correct common spelling errors
  private spellCheckResponse(response: string): string {
    // Fix common spelling mistakes
    return response
      .replace(/\bYur\b/g, "Your")
      .replace(/\byur\b/g, "your")
      .replace(/\bHonr\b/g, "Honor")
      .replace(/\bhonr\b/g, "honor");
  }

  private async callGroqAPI(prompt: string): Promise<string> {
    try {
      console.log("Calling Groq API with key:", this.apiKey ? "API key is set" : "API key is missing");
      
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [
            {
              role: "system",
              content: "You are an AI assistant participating in a legal game simulation. Keep responses brief, concise, and always grammatically correct. Use proper punctuation, capitalization, and complete sentences. Make sure responses follow proper English grammar rules and sound natural. CRITICAL: Always use correct spelling - especially for common words like 'Your' (not 'Yur'), 'Honor', 'Court', etc. Double-check all spelling in your responses. Avoid typos, run-on sentences, or grammatical errors.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 150,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Groq API error details:", {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error calling Groq API:", error);
      throw error;
    }
  }
} 