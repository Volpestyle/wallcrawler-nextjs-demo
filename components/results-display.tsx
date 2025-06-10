"use client";

import type { DemoResult } from "@/lib/ebay-demo";

interface ResultsDisplayProps {
  results: DemoResult;
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  return (
    <div className="space-y-6 max-h-96 overflow-y-auto">
      {/* Search Results */}
      <div>
        <h3 className="font-semibold text-lg mb-2">Search Results ({results.searchResults.length})</h3>
        <div className="space-y-2">
          {results.searchResults.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded p-3 text-sm">
              <div className="font-medium">{item.title}</div>
              <div className="text-gray-600">
                Price: {item.price} {item.condition && `• ${item.condition}`}
              </div>
              {item.shippingInfo && (
                <div className="text-gray-500 text-xs">{item.shippingInfo}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Product */}
      {results.selectedProduct && (
        <div>
          <h3 className="font-semibold text-lg mb-2">Selected Product Details</h3>
          <div className="border border-gray-200 rounded p-4">
            <h4 className="font-medium">{results.selectedProduct.title}</h4>
            <div className="text-lg font-bold text-green-600 mt-1">
              {results.selectedProduct.price}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {results.selectedProduct.description.substring(0, 200)}...
            </p>
            {results.selectedProduct.sellerInfo && (
              <div className="mt-3 text-sm">
                <span className="font-medium">Seller:</span> {results.selectedProduct.sellerInfo.name}
                {results.selectedProduct.sellerInfo.rating && (
                  <span className="ml-2">• Rating: {results.selectedProduct.sellerInfo.rating}</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cart Status */}
      {results.cartStatus && (
        <div>
          <h3 className="font-semibold text-lg mb-2">Cart Status</h3>
          <div className={`rounded p-3 ${
            results.cartStatus.success 
              ? 'bg-green-50 text-green-800' 
              : 'bg-yellow-50 text-yellow-800'
          }`}>
            <div className="flex items-center gap-2">
              <span>{results.cartStatus.success ? '✅' : '⚠️'}</span>
              <span>{results.cartStatus.message || (results.cartStatus.success ? 'Added to cart!' : 'Could not add to cart')}</span>
            </div>
            {results.cartStatus.cartCount !== undefined && (
              <div className="text-sm mt-1">Cart items: {results.cartStatus.cartCount}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}