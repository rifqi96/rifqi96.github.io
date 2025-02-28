// Server API endpoint for Binance exchange info
import axios from "axios";

export default defineEventHandler(async (event) => {
  try {
    const response = await axios.get(
      "https://api.binance.com/api/v3/exchangeInfo",
    );

    // Filter and process the data to reduce payload size
    const symbols = response.data.symbols
      .filter((symbol: any) => symbol.status === "TRADING")
      .map((symbol: any) => ({
        symbol: symbol.symbol,
        baseAsset: symbol.baseAsset,
        quoteAsset: symbol.quoteAsset,
        filters: symbol.filters,
      }));

    return { symbols };
  } catch (error: any) {
    console.error("Error fetching exchange info from Binance API:", error);

    throw createError({
      statusCode: error.response?.status || 500,
      statusMessage:
        error.message || "Error fetching exchange info from Binance",
    });
  }
});
