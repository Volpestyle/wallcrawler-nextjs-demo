import type { WallCrawler as WallCrawlerType } from 'wallcrawler';
import { z } from 'wallcrawler';

// Dynamic import to avoid webpack issues
const getWallCrawler = async () => {
  const { WallCrawler } = await import('wallcrawler');
  return WallCrawler;
};

// Define schemas for structured data extraction
const SearchResultsSchema = z.array(z.object({
  title: z.string(),
  price: z.string(),
  condition: z.string().optional(),
  sellerRating: z.string().optional(),
  shippingInfo: z.string().optional(),
  imageUrl: z.string().url().optional(),
})).max(5); // Get top 5 results

const ProductDetailsSchema = z.object({
  title: z.string(),
  price: z.string(),
  description: z.string(),
  condition: z.string().optional(),
  specifications: z.record(z.string()).optional(),
  sellerInfo: z.object({
    name: z.string(),
    rating: z.string().optional(),
    location: z.string().optional(),
  }).optional(),
  shippingOptions: z.array(z.object({
    method: z.string(),
    cost: z.string(),
    estimatedDelivery: z.string().optional(),
  })).optional(),
});

const CartStatusSchema = z.object({
  success: z.boolean(),
  cartCount: z.number().optional(),
  message: z.string().optional(),
});

export interface DemoResult {
  searchQuery: string;
  searchResults: z.infer<typeof SearchResultsSchema>;
  selectedProduct: z.infer<typeof ProductDetailsSchema> | null;
  cartStatus: z.infer<typeof CartStatusSchema> | null;
  error?: string;
}

export async function runEbayDemo(
  searchQuery: string = "vintage camera",
  onProgress?: (message: string) => void
): Promise<DemoResult> {
  const log = (message: string) => {
    console.log(`[Demo] ${message}`);
    onProgress?.(message);
  };

  const result: DemoResult = {
    searchQuery,
    searchResults: [],
    selectedProduct: null,
    cartStatus: null,
  };

  // Initialize WallCrawler
  const WallCrawler = await getWallCrawler();
  const crawler = new WallCrawler({
    llm: {
      provider: (process.env.LLM_PROVIDER as any) || 'openai',
      model: process.env.LLM_PROVIDER === 'anthropic' ? 'claude-3-opus-20240229' : 'gpt-4o',
      apiKey: process.env.LLM_PROVIDER === 'anthropic' 
        ? process.env.ANTHROPIC_API_KEY 
        : process.env.OPENAI_API_KEY,
    },
    browser: {
      headless: process.env.DEMO_HEADLESS === 'true', // Control via env var
      viewport: { width: 1920, height: 1080 },
      timeout: 30000,
    },
    features: {
      selfHeal: true,
      captchaHandling: false,
      requestInterception: true,
      caching: {
        enabled: true,
        ttl: 300,
        maxSize: 1000,
      },
    },
  });

  try {
    log("Launching browser...");
    await crawler.launch();
    
    const page = await crawler.newPage();
    
    // Step 1: Navigate to eBay
    log("Navigating to eBay...");
    await page.goto('https://www.ebay.com');
    await page.waitForLoadState('networkidle');
    
    // Step 2: Search for product
    log(`Searching for "${searchQuery}"...`);
    await page.act(`Search for "${searchQuery}" using the search bar`);
    await page.waitForLoadState('networkidle');
    
    // Step 3: Extract search results
    log("Extracting search results...");
    result.searchResults = await page.extract({
      instruction: "Extract the top 5 product listings from the search results. Include title, price, condition, seller rating, shipping info, and image URL if available.",
      schema: SearchResultsSchema,
    });
    
    log(`Found ${result.searchResults.length} products`);
    
    if (result.searchResults.length === 0) {
      throw new Error("No search results found");
    }
    
    // Step 4: Click on the first result
    log("Clicking on the first product...");
    await page.act("Click on the first product listing in the search results");
    await page.waitForLoadState('networkidle');
    
    // Step 5: Extract product details
    log("Extracting product details...");
    result.selectedProduct = await page.extract({
      instruction: "Extract comprehensive product details including title, price, description, condition, specifications, seller information, and shipping options.",
      schema: ProductDetailsSchema,
    });
    
    // Step 6: Add to cart (if possible)
    log("Attempting to add product to cart...");
    try {
      await page.act('Click the "Add to cart" or "Buy It Now" button', {
        maxAttempts: 2,
        settlementStrategy: 'patient',
      });
      
      // Wait a bit for cart update
      await page.waitForTimeout(2000);
      
      // Step 7: Check cart status
      log("Checking cart status...");
      result.cartStatus = await page.extract({
        instruction: "Check if the item was successfully added to cart. Look for confirmation messages, cart count updates, or error messages.",
        schema: CartStatusSchema,
      });
    } catch (cartError) {
      log("Could not add to cart (item might require sign-in or have special conditions)");
      result.cartStatus = {
        success: false,
        message: "Could not add to cart - may require sign-in or item has special conditions",
      };
    }
    
    log("Demo completed successfully!");
    
  } catch (error) {
    console.error("Demo error:", error);
    result.error = error instanceof Error ? error.message : String(error);
  } finally {
    log("Closing browser...");
    await crawler.close();
  }
  
  return result;
}