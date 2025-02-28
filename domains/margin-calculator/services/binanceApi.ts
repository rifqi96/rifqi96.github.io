import axios from "axios";
import type { AxiosResponse } from "axios";
import type { SymbolData } from "@/domains/margin-calculator/types";

const BINANCE_FUTURES_EXCHANGE_INFO_URL =
  "https://fapi.binance.com/fapi/v1/exchangeInfo";
const BINANCE_FUTURES_TICKER_URL = "wss://fstream.binance.com/ws";

export async function fetchTickersList(): Promise<string[]> {
  try {
    const response: AxiosResponse<{ symbols: SymbolData[] }> = await axios.get(
      BINANCE_FUTURES_EXCHANGE_INFO_URL,
    );
    return response.data.symbols.map((symbol) => symbol.symbol);
  } catch (error) {
    console.error("Error fetching tickers:", error);
    throw error;
  }
}

export function watchPrice(
  symbol: string,
  callback: (price: number) => void,
): () => void {
  const socket = new WebSocket(
    `${BINANCE_FUTURES_TICKER_URL}/${symbol.toLowerCase()}@ticker`,
  );

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    callback(parseFloat(data.c)); // 'c' is the close price
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  return () => {
    socket.close();
  };
}

export async function getMinMaxLotSize(
  symbol: string,
): Promise<{ minQty: number; maxQty: number }> {
  try {
    const response: AxiosResponse<{ symbols: SymbolData[] }> = await axios.get(
      BINANCE_FUTURES_EXCHANGE_INFO_URL,
    );
    const symbolData = response.data.symbols.find((s) => s.symbol === symbol);

    if (!symbolData) {
      throw new Error(`Symbol ${symbol} not found`);
    }

    const marketLotSizeFilter = symbolData.filters.find(
      (filter) => filter.filterType === "MARKET_LOT_SIZE",
    );

    return {
      minQty: parseFloat(String(marketLotSizeFilter?.minQty || "0")),
      maxQty: parseFloat(String(marketLotSizeFilter?.maxQty || "0")),
    };
  } catch (error) {
    console.error("Error getting lot size:", error);
    throw error;
  }
}
