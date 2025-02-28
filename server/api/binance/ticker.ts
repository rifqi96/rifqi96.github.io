// Server API endpoint for Binance ticker data
import axios from "axios";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const symbol = (query.symbol as string) || "BTCUSDT";

    const response = await axios.get(
      `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`,
    );

    return response.data;
  } catch (error: any) {
    console.error("Error fetching from Binance API:", error);

    throw createError({
      statusCode: error.response?.status || 500,
      statusMessage: error.message || "Error fetching data from Binance",
    });
  }
});
