import { ref, onMounted } from "vue";
import { getTicker } from "@/services/binanceApi";

export function useTicker() {
  const ticker = ref<string[]>([]);
  const isLoading = ref(true);
  const error = ref<string | null>(null);

  const fetchTicker = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const tickers = await getTicker();
      ticker.value = tickers;
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "An error occurred fetching tickers";
    } finally {
      isLoading.value = false;
    }
  };

  const setTicker = (newTicker: string[]) => {
    ticker.value = newTicker;
  };

  onMounted(fetchTicker);

  return {
    ticker,
    isLoading,
    error,
    fetchTicker,
    setTicker,
  };
}
