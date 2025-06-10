import { NextRequest, NextResponse } from 'next/server';
import { runEbayDemo } from '@/lib/ebay-demo';

export const maxDuration = 60; // Allow up to 60 seconds for the demo

export async function POST(request: NextRequest) {
  try {
    const { searchQuery } = await request.json();
    
    // Validate input
    if (!searchQuery || typeof searchQuery !== 'string') {
      return NextResponse.json(
        { error: 'Invalid search query' },
        { status: 400 }
      );
    }
    
    // Check for API keys
    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'No LLM API key configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY in your environment.' },
        { status: 500 }
      );
    }
    
    // Run the demo with progress tracking
    const progressMessages: string[] = [];
    const result = await runEbayDemo(searchQuery, (message) => {
      progressMessages.push(message);
      console.log(message);
    });
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}