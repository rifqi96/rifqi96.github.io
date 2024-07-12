const BASE_URL = "https://fapi.binance.com/fapi/v1";

export async function getTicker(): Promise<string[]> {
  try {
    const response = await fetch(`${BASE_URL}/exchangeInfo`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data.symbols.map((symbol: { symbol: string }) => symbol.symbol);
  } catch (error) {
    console.error("Error fetching tickers:", error);
    throw error;
  }
}

export function watchPrice(
  pair: string,
  callback: (price: number) => void,
): () => void {
  const ws = new WebSocket(
    `wss://fstream.binance.com/ws/${pair.toLowerCase()}@ticker`,
  );

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    callback(parseFloat(data.c)); // 'c' is the current price in the ticker data
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  // Return a function to close the WebSocket connection
  return () => {
    ws.close();
  };
}

export async function getMinMaxLotSize(
  symbol: string,
): Promise<{ minQty: number; maxQty: number }> {
  try {
    const response = await fetch(`${BASE_URL}/exchangeInfo`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    const symbolInfo = data.symbols.find(
      (s: { symbol: string }) => s.symbol === symbol,
    );
    if (!symbolInfo) {
      throw new Error(`Symbol ${symbol} not found`);
    }
    const lotSizeFilter = symbolInfo.filters.find(
      (f: { filterType: string }) => f.filterType === "LOT_SIZE",
    );
    if (!lotSizeFilter) {
      throw new Error(`LOT_SIZE filter not found for symbol ${symbol}`);
    }
    return {
      minQty: parseFloat(lotSizeFilter.minQty),
      maxQty: parseFloat(lotSizeFilter.maxQty),
    };
  } catch (error) {
    console.error("Error fetching lot size:", error);
    throw error;
  }
}
