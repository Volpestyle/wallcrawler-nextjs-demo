"use client";

interface CodeViewerProps {
  searchQuery: string;
}

export default function CodeViewer({ searchQuery }: CodeViewerProps) {
  const codeExample = `import { WallCrawler, z } from 'wallcrawler';

// Initialize WallCrawler with your preferred LLM
const crawler = new WallCrawler({
  llm: {
    provider: 'openai',
    model: 'gpt-4o',
  },
  browser: {
    headless: true,
  },
});

await crawler.launch();
const page = await crawler.newPage();

// 1. Navigate to eBay
await page.goto('https://www.ebay.com');

// 2. Search using natural language
await page.act('Search for "${searchQuery}"');

// 3. Extract structured data with Zod schema
const results = await page.extract({
  instruction: 'Extract top 5 product listings',
  schema: z.array(z.object({
    title: z.string(),
    price: z.string(),
    condition: z.string(),
  }))
});

// 4. Click on first result
await page.act('Click on the first product');

// 5. Extract detailed info
const details = await page.extract({
  instruction: 'Extract product details',
  schema: ProductDetailsSchema
});

// 6. Add to cart
await page.act('Add to cart');

await crawler.close();`;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4">Code Example</h2>
      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
        <pre className="text-sm">
          <code>{codeExample}</code>
        </pre>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        This demo showcases WallCrawler's key features: natural language actions, 
        structured data extraction, and seamless browser automation.
      </div>
    </div>
  );
}