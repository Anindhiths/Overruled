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
    const prompt = `You are an AI judge in a legal game. Provide a brief, concise response (1-2 sentences) that maintains judicial decorum and guides the proceedings.
    
    Context: ${context}
    
    Respond as judge:`;

    try {
      const response = await this.callGroqAPI(prompt);
      return response;
    } catch (error) {
      console.error("Error generating judge response:", error);
      return "The court will take that under advisement.";
    }
  }

  async generateOpponentResponse(context: string): Promise<string> {
    const prompt = `You are an AI opposing counsel in a legal game. Provide a brief, concise response (1-2 sentences) that challenges the player's arguments while maintaining professionalism.
    
    Context: ${context}
    
    Respond as opposing counsel:`;

    try {
      const response = await this.callGroqAPI(prompt);
      return response;
    } catch (error) {
      console.error("Error generating opponent response:", error);
      return "I object to that line of questioning, your honor.";
    }
  }

  async generateWitnessResponse(context: string, witnessRole: string): Promise<string> {
    const prompt = `You are a ${witnessRole} witness in a legal game. Provide a brief, concise response (1-2 sentences) that stays in character and provides relevant testimony.
    
    Context: ${context}
    
    Respond as the witness:`;

    try {
      const response = await this.callGroqAPI(prompt);
      return response;
    } catch (error) {
      console.error("Error generating witness response:", error);
      return "I don't recall, your honor.";
    }
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
              content: "You are an AI assistant participating in a legal game simulation. Keep responses brief and concise.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 50,
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