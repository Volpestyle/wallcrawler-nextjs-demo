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
    
    // Create a stream for real-time progress
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    
    // Run the demo in the background
    (async () => {
      try {
        const result = await runEbayDemo(searchQuery, async (message) => {
          // Send progress update
          const progressData = JSON.stringify({ type: 'progress', message }) + '\n';
          await writer.write(encoder.encode(progressData));
        });
        
        // Send final result
        const resultData = JSON.stringify({ type: 'result', data: result }) + '\n';
        await writer.write(encoder.encode(resultData));
      } catch (error) {
        const errorData = JSON.stringify({ 
          type: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }) + '\n';
        await writer.write(encoder.encode(errorData));
      } finally {
        await writer.close();
      }
    })();
    
    // Return the stream
    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}