<script setup lang="ts">
import { useMarginCalculator } from "@/domains/margin-calculator/composables/useMarginCalculator";
import type { Trade } from "@/domains/margin-calculator/types";

const showError = ref(false);
const errorMessage = ref("");
const showCopySuccess = ref(false);

const {
  // State
  slot,
  apiSecret,
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

// Date formatting function
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // For trades less than 1 hour old
    if (diffHours < 1) {
      return "Just now";
    }

    // For trades between 1 and 24 hours old
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }

    // For trades between 1 and 7 days old
    if (diffDays < 7) {
      return `${diffDays}d ago`;
    }

    // For older dates, use the original format DD/MM/YYYY
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  } catch (e) {
    return dateString;
  }
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
  <v-container class="px-1 py-1 fill-height" style="max-width: none">
    <v-row no-gutters>
      <v-col cols="12" md="8">
        <v-card class="pa-3">
          <v-form @submit.prevent class="mt-n2">
            <!-- Add these fields at the top of the form -->
            <v-row dense class="my-1">
              <v-col cols="12" md="6" class="py-1">
                <v-text-field
                  v-model="slot"
                  label="Slot Number (Optional)"
                  placeholder="Enter your slot number"
                  variant="outlined"
                  density="comfortable"
                  hint="Leave empty to use default"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6" class="py-1">
                <v-text-field
                  v-model="apiSecret"
                  label="API Secret (Optional)"
                  placeholder="Enter your API secret"
                  variant="outlined"
                  density="comfortable"
                  hint="Leave empty to use default"
                  type="password"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row dense class="my-1">
              <v-col cols="12" md="6" class="py-1">
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

              <v-col cols="12" md="6" class="py-1">
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

            <v-row dense class="my-1">
              <v-col cols="12" md="6" class="py-1">
                <v-text-field
                  :model-value="stopLossPercent"
                  @update:model-value="(val) => (stopLossPercent = Number(val))"
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

              <v-col cols="12" md="6" class="py-1">
                <v-text-field
                  :model-value="stopLossDollar"
                  @update:model-value="(val) => (stopLossDollar = Number(val))"
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

            <v-row dense class="my-1">
              <v-col cols="12" md="6" class="py-1">
                <v-text-field
                  :model-value="smPrice"
                  @update:model-value="(val) => (smPrice = Number(val))"
                  type="number"
                  step="0.01"
                  label="Stop Market Price (optional)"
                  @input="calculate"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6" class="py-1">
                <v-text-field
                  :model-value="slPrice"
                  @update:model-value="(val) => (slPrice = Number(val))"
                  type="number"
                  label="SL Price (optional)"
                  @input="calculate"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row dense class="my-1">
              <v-col cols="12" md="6" class="py-1">
                <v-text-field
                  :model-value="leverage"
                  @update:model-value="(val) => (leverage = Number(val))"
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

              <v-col cols="12" md="6" class="py-1">
                <v-text-field
                  :model-value="rr"
                  @update:model-value="(val) => (rr = Number(val))"
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

            <v-row dense class="mt-0 mb-0">
              <v-col cols="6" md="3" class="py-1">
                <v-btn
                  color="success"
                  :class="{ 'v-btn--active': position === 'buy' }"
                  @click="() => calculate(undefined, 'buy')"
                  block
                >
                  Buy
                </v-btn>
              </v-col>
              <v-col cols="6" md="3" class="py-1">
                <v-btn
                  color="error"
                  :class="{ 'v-btn--active': position === 'sell' }"
                  @click="() => calculate(undefined, 'sell')"
                  block
                >
                  Sell
                </v-btn>
              </v-col>
              <v-col cols="6" md="3" class="py-1">
                <v-btn
                  color="primary"
                  :disabled="!formReady"
                  @click="sendOrder"
                  block
                >
                  Send Order
                </v-btn>
              </v-col>
              <v-col cols="6" md="3" class="py-1">
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

            <v-row dense class="mt-0 mb-0">
              <v-col cols="6" md="3" class="py-1">
                <v-btn
                  color="primary-darken-1"
                  variant="outlined"
                  @click="addTrade"
                  block
                >
                  Add Trade
                </v-btn>
              </v-col>
              <v-col cols="6" md="3" class="py-1">
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

            <v-row dense class="mt-1">
              <v-col cols="12" class="py-1">
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

            <v-row dense class="my-0">
              <v-col cols="12" class="py-1">
                <v-text-field
                  :model-value="reduceAmount"
                  @update:model-value="(val) => (reduceAmount = Number(val))"
                  type="number"
                  label="How much to reduce the trade for"
                  @input="calculate"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row dense class="my-0">
              <v-col cols="12" class="py-1">
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

            <v-row dense class="my-0">
              <v-col cols="12" class="py-1">
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

      <v-col cols="12" md="4" class="pl-md-4 pl-0 pr-1">
        <v-card class="trade-history-card" flat>
          <v-card-title class="text-h6 bg-grey-lighten-3 py-1 px-2">
            Trade History
          </v-card-title>
          <v-card-text class="pa-0">
            <v-list
              id="trade-history-list"
              class="overflow-y-auto"
              max-height="600"
              density="compact"
              v-if="trades.length > 0"
            >
              <v-list-item
                v-for="(trade, index) in trades"
                :key="index"
                @click="loadTrade(trade)"
                class="trade-history-item position-relative"
                :class="{ 'bg-grey-lighten-5': index % 2 === 0 }"
                rounded="0"
              >
                <v-list-item-title class="text-subtitle-2 font-weight-medium">
                  {{ formatDate(trade.datetime) }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2">
                  {{ trade.pair }} - {{ trade.position.toUpperCase()
                  }}{{ trade.mode === "hedge" ? " (H)" : "" }}
                </v-list-item-subtitle>
                <v-list-item-subtitle class="text-caption">
                  Leverage: {{ trade.leverage }}x
                </v-list-item-subtitle>
                <template v-if="trade.slPrice">
                  <v-list-item-subtitle class="text-caption">
                    {{
                      trade.openPrice
                        ? `Open: ${Number(trade.openPrice).toFixed(2)}`
                        : ""
                    }}
                  </v-list-item-subtitle>
                  <v-list-item-subtitle class="text-caption">
                    TP/SL:
                    {{
                      trade.tpPrice
                        ? `${Number(trade.tpPrice).toFixed(2)}/`
                        : ""
                    }}{{ trade.slPrice }}
                  </v-list-item-subtitle>
                </template>
                <template v-else>
                  <v-list-item-subtitle class="text-caption">
                    TP/SL: {{ trade.stopLossPercent * trade.rr }}%/{{
                      trade.stopLossPercent
                    }}%
                  </v-list-item-subtitle>
                </template>
                <template v-slot:append>
                  <v-btn
                    icon
                    variant="tonal"
                    color="error"
                    size="small"
                    @click.stop="deleteTrade(index)"
                    class="delete-btn"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
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
    <!-- <v-snackbar v-model="showError" color="error" timeout="3000">
      {{ errorMessage }}
    </v-snackbar> -->

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
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
  padding: 8px 12px;
}

.trade-history-item:hover {
  background-color: rgba(var(--v-theme-surface-variant), 0.15);
  border-left-color: rgb(var(--v-theme-primary));
}

.delete-btn {
  margin-left: 5px;
  min-width: 30px !important;
  width: 30px !important;
  height: 30px !important;
}

.delete-btn:hover {
  transform: scale(1.1);
}

.trade-history-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.v-list-item-subtitle {
  margin-bottom: 2px;
}
</style>
@/domains/margin-calculator/types
