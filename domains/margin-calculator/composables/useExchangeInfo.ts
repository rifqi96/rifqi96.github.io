/**
 * Composable to fetch and manage exchange info data from Binance
 */

interface SymbolInfo {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  filters: any[];
}

export function useExchangeInfo() {
  const symbols = ref<SymbolInfo[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchExchangeInfo = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await useFetch<{ symbols: SymbolInfo[] }>(
        "/api/binance/exchange-info",
      );
      if (data.value) {
        symbols.value = data.value.symbols;
      }
    } catch (err: any) {
      error.value = err.message || "Failed to fetch exchange info";
      console.error("Error fetching exchange info:", err);
    } finally {
      loading.value = false;
    }
  };

  // Get trading pairs with specific quote asset (e.g., USDT)
  const getTradingPairs = (quoteAsset: string) => {
    return symbols.value
      .filter((s) => s.quoteAsset === quoteAsset)
      .map((s) => s.symbol);
  };

  // Fetch data on component mount
  onMounted(() => {
    fetchExchangeInfo();
  });

  return {
    symbols,
    loading,
    error,
    fetchExchangeInfo,
    getTradingPairs,
  };
}
