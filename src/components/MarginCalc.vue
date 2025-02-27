<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useMarginCalculator } from "@/composables/useMarginCalculator";
import { Trade } from "@/types";

const showError = ref(false);
const errorMessage = ref("");
const showCopySuccess = ref(false);

const {
  // State
  mode,
  stopLossPercent,
  stopLossDollar,
  leverage,
  rr,
  position,
  text,
  reduceAmount,
  reduceText,
  beText,
  formReady,
  pair,
  price,
  slPrice,
  smPrice,
  tickers,
  isLoading,
  error,
  trades,

  // Methods
  authenticate,
  fetchTickers,
  watchPrice,
  calculate,
  generateText,
  generateReduceTextWithSecret,
  generateBeTextWithSecret,
  copyToClipboard,
  addTrade,
  clearTrades,
  loadTradeHistory,
  loadTrade,
  deleteTrade,
  sendOrder,
  closeTrade,
} = useMarginCalculator();

// Ticker search and autocomplete
const searchTerm = ref("");
const showTickerSuggestions = ref(false);

const filteredTickers = computed(() => {
  if (!searchTerm.value) return [];
  return tickers.value
    .filter((ticker) =>
      ticker.toLowerCase().includes(searchTerm.value.toLowerCase()),
    )
    .slice(0, 30); // Limit to 30 results for performance
});

const searchTickers = (value: string) => {
  searchTerm.value = value;
  showTickerSuggestions.value = true;
};

const selectTicker = (ticker: string) => {
  pair.value = ticker;
  showTickerSuggestions.value = false;
  watchPrice(ticker);
};

// Copy functions
const copyTradeText = () => {
  copyToClipboard(generateText(true));
  showCopySuccess.value = true;
  setTimeout(() => (showCopySuccess.value = false), 2000);
};

const copyReduceTradeText = () => {
  copyToClipboard(generateReduceTextWithSecret(true));
  showCopySuccess.value = true;
  setTimeout(() => (showCopySuccess.value = false), 2000);
};

const copyBeTradeText = () => {
  copyToClipboard(generateBeTextWithSecret(true));
  showCopySuccess.value = true;
  setTimeout(() => (showCopySuccess.value = false), 2000);
};

onMounted(() => {
  authenticate();
  loadTradeHistory();
});
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="9">
        <v-card class="pa-4">
          <v-form @submit.prevent>
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="mode"
                  :items="[
                    { title: 'One-way', value: 'one-way' },
                    { title: 'Hedge', value: 'hedge' },
                  ]"
                  label="Trading Mode"
                  @update:modelValue="() => calculate()"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>

              <v-col cols="12" md="6">
                <!-- Ticker input with autocomplete suggestions -->
                <v-text-field
                  v-model="pair"
                  label="Ticker"
                  placeholder="Enter a trading pair (e.g., BTCUSDT)"
                  variant="outlined"
                  density="comfortable"
                  :loading="isLoading"
                  :error-messages="error ? [error] : []"
                  @input="searchTickers"
                  @blur="pair && watchPrice(pair)"
                >
                  <template v-if="price && pair !== 'PAIR'" v-slot:append>
                    <v-chip size="small" color="primary" text-color="white">{{
                      price
                    }}</v-chip>
                  </template>
                </v-text-field>

                <!-- Autocomplete suggestions menu -->
                <v-menu
                  v-model="showTickerSuggestions"
                  :close-on-content-click="true"
                  :activator="'parent'"
                  location="bottom"
                  min-width="100%"
                  max-height="300"
                  max-width="100%"
                >
                  <v-list v-if="filteredTickers.length > 0" density="compact">
                    <v-list-item
                      v-for="ticker in filteredTickers"
                      :key="ticker"
                      :value="ticker"
                      @click="selectTicker(ticker)"
                    >
                      <v-list-item-title>{{ ticker }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                  <v-card v-else-if="isLoading" flat>
                    <v-card-text class="text-center py-2">
                      <v-progress-circular
                        indeterminate
                        size="20"
                        color="primary"
                      ></v-progress-circular>
                      <span class="ml-2">Loading tickers...</span>
                    </v-card-text>
                  </v-card>
                  <v-card v-else-if="searchTerm" flat>
                    <v-card-text class="text-center py-2">
                      No matching tickers found
                    </v-card-text>
                  </v-card>
                </v-menu>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="stopLossPercent"
                  type="number"
                  step="0.01"
                  label="Stop Loss Percentage"
                  @input="calculate"
                  :rules="[
                    (v: boolean) => !!v || 'Required',
                    (v: number) => v > 0 || 'Must be greater than 0',
                  ]"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="stopLossDollar"
                  type="number"
                  label="Stop Loss in Dollar"
                  @input="calculate"
                  :rules="[
                    (v: boolean) => !!v || 'Required',
                    (v: number) => v > 0 || 'Must be greater than 0',
                  ]"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="smPrice"
                  type="number"
                  step="0.01"
                  label="Stop Market Price (optional)"
                  @input="calculate"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="slPrice"
                  type="number"
                  label="SL Price (optional)"
                  @input="calculate"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="leverage"
                  type="number"
                  label="Leverage"
                  @input="calculate"
                  :rules="[
                    (v: boolean) => !!v || 'Required',
                    (v: number) => v > 0 || 'Must be greater than 0',
                  ]"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="rr"
                  type="number"
                  min="1"
                  max="30"
                  step="0.1"
                  label="Reward to Risk Ratio"
                  variant="outlined"
                  density="comfortable"
                  hint="Enter a value between 1 and 30"
                  @input="calculate"
                  :rules="[
                    (v: number) => v >= 1 || 'Value must be at least 1',
                    (v: number) => v <= 30 || 'Value must be at most 30',
                  ]"
                >
                  <template v-slot:append>
                    <span class="text-caption mr-2">:1</span>
                  </template>
                </v-text-field>
              </v-col>
            </v-row>

            <v-row class="mt-2">
              <v-col cols="6" md="3">
                <v-btn
                  color="success"
                  :class="{ 'v-btn--active': position === 'buy' }"
                  @click="() => calculate(undefined, 'buy')"
                  block
                >
                  Buy
                </v-btn>
              </v-col>
              <v-col cols="6" md="3">
                <v-btn
                  color="error"
                  :class="{ 'v-btn--active': position === 'sell' }"
                  @click="() => calculate(undefined, 'sell')"
                  block
                >
                  Sell
                </v-btn>
              </v-col>
              <v-col cols="6" md="3">
                <v-btn
                  color="primary"
                  :disabled="!formReady"
                  @click="sendOrder"
                  block
                >
                  Send Order
                </v-btn>
              </v-col>
              <v-col cols="6" md="3">
                <v-btn
                  color="grey-darken-1"
                  :disabled="!formReady"
                  @click="closeTrade"
                  block
                >
                  Close Trade
                </v-btn>
              </v-col>
            </v-row>

            <v-row class="mt-2">
              <v-col cols="6" md="3">
                <v-btn
                  color="primary-darken-1"
                  variant="outlined"
                  @click="addTrade"
                  block
                >
                  Add Trade
                </v-btn>
              </v-col>
              <v-col cols="6" md="3">
                <v-btn
                  color="grey-darken-2"
                  variant="outlined"
                  @click="clearTrades"
                  block
                >
                  Clear Trades
                </v-btn>
              </v-col>
            </v-row>

            <v-row class="mt-4">
              <v-col cols="12">
                <v-textarea
                  v-model="text"
                  label="Use the following text to open a trade"
                  readonly
                  rows="4"
                  class="mt-2"
                  variant="outlined"
                ></v-textarea>
                <v-btn
                  color="primary"
                  :disabled="!text"
                  @click="copyTradeText"
                  class="mb-4"
                >
                  Copy to Clipboard
                </v-btn>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="reduceAmount"
                  type="number"
                  label="How much to reduce the trade for"
                  @input="calculate"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-textarea
                  v-model="reduceText"
                  label="Use the following text to reduce the trade above"
                  readonly
                  rows="4"
                  variant="outlined"
                ></v-textarea>
                <v-btn
                  color="primary"
                  :disabled="!reduceText"
                  @click="copyReduceTradeText"
                  class="mb-4"
                >
                  Copy to Clipboard
                </v-btn>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-textarea
                  v-model="beText"
                  label="Use the following text to set the trade breakeven"
                  readonly
                  rows="4"
                  variant="outlined"
                ></v-textarea>
                <v-btn
                  color="primary"
                  :disabled="!beText"
                  @click="copyBeTradeText"
                  class="mb-4"
                >
                  Copy to Clipboard
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="trade-history-card">
          <v-card-title class="text-h6 bg-grey-lighten-3 pa-4">
            Trade History
          </v-card-title>
          <v-card-text class="pa-2">
            <v-list
              id="trade-history-list"
              class="overflow-y-auto"
              max-height="600"
              v-if="trades.length > 0"
            >
              <v-list-item
                v-for="(trade, index) in trades"
                :key="index"
                @click="loadTrade(trade)"
                class="mb-2 trade-history-item rounded-lg"
              >
                <v-list-item-title>
                  {{ trade.datetime }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ trade.pair }} - {{ trade.position.toUpperCase() }}
                </v-list-item-subtitle>
                <template v-if="trade.slPrice">
                  <v-list-item-subtitle>
                    {{
                      trade.openPrice
                        ? `Open: ${Number(trade.openPrice).toFixed(2)},`
                        : ""
                    }}
                    TP/SL:
                    {{
                      trade.tpPrice
                        ? `${Number(trade.tpPrice).toFixed(2)}/`
                        : ""
                    }}{{ trade.slPrice }}
                  </v-list-item-subtitle>
                </template>
                <template v-slot:append>
                  <v-btn
                    icon="mdi-delete"
                    variant="text"
                    color="error"
                    size="small"
                    @click.stop="deleteTrade(index)"
                  ></v-btn>
                </template>
              </v-list-item>
            </v-list>
            <div v-else class="text-center pa-4 text-medium-emphasis">
              No trades saved yet
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbars for feedback -->
    <v-snackbar v-model="showError" color="error" timeout="3000">
      {{ errorMessage }}
    </v-snackbar>

    <v-snackbar v-model="showCopySuccess" color="success" timeout="2000">
      Copied to clipboard!
    </v-snackbar>
  </v-container>
</template>

<style scoped>
.v-btn--active {
  transform: scale(1.05);
  font-weight: bold;
}

.v-text-field input[type="number"] {
  -moz-appearance: textfield;
}

.v-text-field input[type="number"]::-webkit-outer-spin-button,
.v-text-field input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.trade-history-item {
  cursor: pointer;
  border-left: 4px solid transparent;
  transition: all 0.2s ease;
}

.trade-history-item:hover {
  background-color: rgb(var(--v-theme-surface-variant));
  border-left-color: rgb(var(--v-theme-primary));
}

.trade-history-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
