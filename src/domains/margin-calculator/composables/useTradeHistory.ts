import { ref, watch } from "vue";
import type { Trade } from "@/types";

const STORAGE_KEY = "trade_history";

export function useTradeHistory() {
  const trades = ref<Trade[]>([]);

  // Load trades from localStorage on initialization
  const loadTradesFromStorage = () => {
    const storedTrades = localStorage.getItem(STORAGE_KEY);
    if (storedTrades) {
      trades.value = JSON.parse(storedTrades);
    }
  };

  // Save trades to localStorage whenever it changes
  watch(
    trades,
    (newTrades) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newTrades));
    },
    { deep: true },
  );

  const addTrade = (trade: Trade) => {
    trades.value.unshift(trade); // Add new trade to the beginning of the array
  };

  const clearTrades = () => {
    trades.value = [];
    localStorage.removeItem(STORAGE_KEY);
  };

  const loadTrade = (trade: Trade) => {
    return {
      updateParentState: (updateFn: (trade: Trade) => void) => {
        updateFn(trade);
      },
    };
  };

  const deleteTrade = (index: number) => {
    trades.value.splice(index, 1);
  };

  // Initialize trades from storage
  loadTradesFromStorage();

  return {
    trades,
    addTrade,
    clearTrades,
    loadTrade,
    deleteTrade,
  };
}
