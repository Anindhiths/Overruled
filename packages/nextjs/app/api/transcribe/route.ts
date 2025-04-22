import { NextRequest, NextResponse } from 'next/server';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    // Check for FormData
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Set up Groq API request
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    
    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Create a new FormData object for the Groq API request
    // This matches the documented API format which uses multipart/form-data
    const groqFormData = new FormData();
    
    // Add the audio file with the correct field name 'file'
    groqFormData.append('file', audioFile);
    
    // Add other required and optional parameters
    groqFormData.append('model', 'whisper-large-v3'); // Using whisper-large-v3 model as requested
    groqFormData.append('temperature', '0');
    groqFormData.append('response_format', 'json'); // Use json for simpler parsing
    groqFormData.append('language', 'en');
    
    // Make request to Groq API using the documented format
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`
        // Don't set Content-Type header - fetch will set it correctly with the boundary for multipart/form-data
      },
      body: groqFormData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to transcribe audio', details: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('Transcription result:', result);
    
    return NextResponse.json({ text: result.text });
  } catch (error) {
    console.error('Error processing transcription:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 