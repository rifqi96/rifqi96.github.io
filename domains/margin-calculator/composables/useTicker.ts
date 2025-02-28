import { fetchTickersList } from "@/domains/margin-calculator/services/binanceApi";

export function useTicker() {
  const ticker = ref<string[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchTickers = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const tickers = await fetchTickersList();
      ticker.value = tickers;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch tickers";
      console.error(error.value);
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(fetchTickers);

  return {
    ticker,
    isLoading,
    error,
    fetchTickers,
  };
}
