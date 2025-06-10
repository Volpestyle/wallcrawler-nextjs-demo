"use client";

import { useState } from "react";
import DemoRunner from "@/components/demo-runner";
import CodeViewer from "@/components/code-viewer";
import ResultsDisplay from "@/components/results-display";
import type { DemoResult } from "@/lib/ebay-demo";

export default function Home() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);
  const [results, setResults] = useState<DemoResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("vintage camera");

  const runDemo = async () => {
    setIsRunning(true);
    setProgress([]);
    setResults(null);
    setError(null);

    // Simulate progress messages
    const progressMessages = [
      "Launching browser...",
      "Navigating to eBay...",
      `Searching for "${searchQuery}"...`,
      "Extracting search results...",
      "Clicking on the first product...",
      "Extracting product details...",
      "Attempting to add product to cart...",
      "Demo completed!"
    ];

    try {
      // Show progress messages
      for (let i = 0; i < 3; i++) {
        setProgress(prev => [...prev, progressMessages[i]]);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const response = await fetch("/api/demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ searchQuery }),
      });

      // Show remaining progress messages while waiting
      const responsePromise = response.json();
      for (let i = 3; i < progressMessages.length - 1; i++) {
        setProgress(prev => [...prev, progressMessages[i]]);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const data = await responsePromise;

      if (!response.ok) {
        throw new Error(data.error || "Demo failed");
      }

      setProgress(prev => [...prev, progressMessages[progressMessages.length - 1]]);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            WallCrawler Demo 🕷️
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Watch WallCrawler automate eBay product search, data extraction, and cart operations
            using natural language commands.
          </p>
        </div>

        {/* Demo Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Run Demo</h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Query
              </label>
              <input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., vintage camera, rare books, collectible toys"
                disabled={isRunning}
              />
            </div>
            <button
              onClick={runDemo}
              disabled={isRunning || !searchQuery.trim()}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isRunning ? "Running..." : "Run Demo"}
            </button>
          </div>
        </div>

        {/* Code Preview */}
        <div className="mb-8">
          <CodeViewer searchQuery={searchQuery} />
        </div>

        {/* Progress & Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Progress Log */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Progress Log</h2>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
              {progress.length === 0 && !isRunning && (
                <div className="text-gray-500">Waiting to start...</div>
              )}
              {isRunning && progress.length === 0 && (
                <div className="text-yellow-400">Starting demo...</div>
              )}
              {progress.map((message, index) => (
                <div key={index} className="mb-1">
                  <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span>{" "}
                  {message}
                </div>
              ))}
              {error && (
                <div className="text-red-400 mt-2">❌ Error: {error}</div>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Results</h2>
            {results ? (
              <ResultsDisplay results={results} />
            ) : (
              <div className="text-gray-500 text-center py-8">
                Run the demo to see results here
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">How it works</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• WallCrawler uses Playwright for browser automation</li>
            <li>• Natural language instructions are processed by LLMs (OpenAI or Anthropic)</li>
            <li>• Data extraction uses Zod schemas for type-safe results</li>
            <li>• The demo runs in headless mode on the server</li>
          </ul>
          <div className="mt-4">
            <a
              href="https://github.com/Volpestyle/wallcrawler"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View WallCrawler on GitHub →
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}