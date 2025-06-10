# WallCrawler Next.js Demo

A demo Next.js application showcasing [WallCrawler](https://github.com/Volpestyle/wallcrawler) browser automation capabilities with a real-world eBay automation example.

## Features

This demo shows how WallCrawler can:
- 🔍 Search for products using natural language
- 📊 Extract structured data with type-safe Zod schemas
- 🖱️ Click elements and navigate pages
- 🛒 Add items to cart
- 🤖 Use multiple LLM providers (OpenAI, Anthropic)
- 📡 Real-time progress updates as actions execute
- 👀 Visual browser automation (can run with browser visible)

## Prerequisites

- Node.js 18+ 
- pnpm
- An OpenAI or Anthropic API key

## Setup

1. Clone the repository:
```bash
git clone https://github.com/Volpestyle/wallcrawler-nextjs-demo.git
cd wallcrawler-nextjs-demo
```

2. Install dependencies:
```bash
pnpm install
```

3. Configure your environment:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API key:
```env
# For OpenAI (default)
OPENAI_API_KEY=your-api-key-here
LLM_PROVIDER=openai

# OR for Anthropic
ANTHROPIC_API_KEY=your-api-key-here
LLM_PROVIDER=anthropic

# To see the browser in action (local development)
DEMO_HEADLESS=false

# For deployment/CI (runs without visible browser)
DEMO_HEADLESS=true
```

4. Run the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## How It Works

The demo automates a complete eBay shopping flow:

1. **Search** - Uses natural language to search for products
2. **Extract** - Extracts structured data from search results
3. **Navigate** - Clicks on the first product
4. **Analyze** - Extracts detailed product information
5. **Action** - Attempts to add the item to cart

All powered by WallCrawler's simple API:
```typescript
// Natural language actions
await page.act('Search for "vintage camera"');

// Type-safe data extraction
const results = await page.extract({
  instruction: 'Extract product listings',
  schema: z.array(z.object({
    title: z.string(),
    price: z.string(),
    condition: z.string(),
  }))
});
```

## Project Structure

```
├── app/
│   ├── api/demo/route.ts    # API endpoint for running the demo
│   ├── page.tsx             # Main demo UI
│   └── layout.tsx           # Root layout
├── components/
│   ├── code-viewer.tsx      # Shows example code
│   └── results-display.tsx  # Displays extraction results
├── lib/
│   └── ebay-demo.ts        # Core WallCrawler automation script
└── .env.example            # Environment variables template
```

## Customization

You can modify the demo to:
- Search for different products
- Extract different data fields
- Automate other e-commerce sites
- Add more complex workflows

Check out the [WallCrawler documentation](https://github.com/Volpestyle/wallcrawler) for more examples and API details.

## Deployment

This demo can be deployed to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Volpestyle/wallcrawler-nextjs-demo)

Note: Server-side browser automation requires appropriate hosting that supports long-running functions.

## License

MIT