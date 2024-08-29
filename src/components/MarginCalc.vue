<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useTicker } from "@/composables/useTicker";
import { useTradeHistory } from "@/composables/useTradeHistory";
import {
  generateCommand,
  generateReduceCommand,
  generateBeCommand,
  generateSLCommand,
} from "@/utils/commandGenerators";
import { watchPrice, getMinMaxLotSize } from "@/services/binanceApi";
import type { Trade } from "@/types";

// State
const tradingMode = ref("One-way");
const slotNumber = ref("13");
const apiSecret = ref(
  "3fa7c1ec483bcc7112ccf94552194fe21576d5b8259f49891ef6e5a5aaia2419",
);
const stopLossPercent = ref(0);
const stopLossDollar = ref(0);
const leverage = ref(1);
const rr = ref(4);
const pair = ref("");
const position = ref("");
const reduceAmount = ref(0);
const slPrice = ref<number | null>(null);
const currentPrice = ref<number | null>(null);

// Composables
const { ticker, isLoading: isTickerLoading, error: tickerError } = useTicker();
const { trades, addTrade, clearTrades, loadTrade, deleteTrade } =
  useTradeHistory();

// Computed values
const deployedCapital = computed(() => {
  if (stopLossPercent.value && stopLossDollar.value && leverage.value) {
    return (
      stopLossDollar.value / (stopLossPercent.value / 100) / leverage.value
    );
  }
  return 0;
});

const rewardPercent = computed(() => stopLossPercent.value * rr.value);

const positionCmd = computed(() => {
  if (tradingMode.value === "Hedge") {
    return position.value === "buy" ? "openlong" : "openshort";
  }
  return position.value;
});

const text = computed(() => {
  if (!pair.value || !position.value) return "";
  let command = generateCommand(
    pair.value,
    positionCmd.value,
    deployedCapital.value,
    rewardPercent.value,
    stopLossPercent.value,
    leverage.value,
    !!slPrice.value,
  );
  if (slPrice.value) {
    command += ";\n" + slText.value;
  }
  return command;
});

const reduceText = computed(() => {
  if (!pair.value || !position.value) return "";
  return generateReduceCommand(
    pair.value,
    position.value === "buy" ? "sell" : "buy",
    reduceAmount.value,
    leverage.value,
  );
});

const beText = computed(() => {
  if (!pair.value) return "";
  return generateBeCommand(
    pair.value,
    tradingMode.value === "Hedge" ? "tpsl_h" : "tpsl",
    position.value === "buy" ? "long" : "short",
  );
});

const slText = computed(() => {
  if (!pair.value || !slPrice.value || !currentPrice.value) return "";
  const amountToBeLiquidated =
    (deployedCapital.value * leverage.value) / slPrice.value;
  return generateSLCommand(
    pair.value,
    tradingMode.value === "Hedge" ? "tpsl_h" : "tpsl",
    position.value === "buy" ? "long" : "short",
    slPrice.value,
    amountToBeLiquidated,
    leverage.value,
  );
});

// Methods
const calculate = async () => {
  if (!pair.value || !position.value) {
    alert("Please select a pair and position");
    return;
  }

  try {
    const { minQty, maxQty } = await getMinMaxLotSize(pair.value);
    if (deployedCapital.value < minQty || deployedCapital.value > maxQty) {
      alert(`Deployed capital must be between ${minQty} and ${maxQty}`);
      return;
    }

    const trade: Trade = {
      datetime: new Date().toLocaleString(),
      pair: pair.value,
      leverage: leverage.value,
      position: position.value,
      stopLossPercent: stopLossPercent.value,
      stopLossDollar: stopLossDollar.value,
      slPrice: slPrice.value,
      rr: rr.value,
      text: text.value,
      reduceText: reduceText.value,
      beText: beText.value,
      slText: slText.value,
    };
    addTrade(trade);
  } catch (error) {
    console.error("Error calculating trade:", error);
    alert("An error occurred while calculating the trade. Please try again.");
  }
};

const handleLoadTrade = (trade: Trade) => {
  loadTrade(trade).updateParentState((loadedTrade) => {
    tradingMode.value = loadedTrade.position === "buy" ? "One-way" : "Hedge";
    pair.value = loadedTrade.pair;
    leverage.value = loadedTrade.leverage;
    position.value = loadedTrade.position;
    stopLossPercent.value = loadedTrade.stopLossPercent;
    stopLossDollar.value = loadedTrade.stopLossDollar;
    slPrice.value = loadedTrade.slPrice;
    rr.value = loadedTrade.rr;
    // You might want to recalculate other values here if needed
  });
};

const sendOrder = () => {
  // Implement order sending logic here
  console.log("Sending order:", text.value);
  alert("Order sent (simulated)");
};

const closeTrade = () => {
  const closePercent = prompt("Enter close percentage (1-100):", "100");
  if (closePercent === null) return;
  const percent = parseInt(closePercent, 10);
  if (isNaN(percent) || percent < 1 || percent > 100) {
    alert("Invalid percentage. Please enter a number between 1 and 100.");
    return;
  }
  // Implement trade closing logic here
  console.log(`Closing ${percent}% of the trade`);
  alert(`Closing ${percent}% of the trade (simulated)`);
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(
    () => {
      // Success message can be shown here
    },
    (err) => {
      console.error("Error copying to clipboard:", err);
      alert("An error occurred while copying to clipboard. Please try again.");
    },
  );
};

// Watchers
let unwatchPrice: (() => void) | null = null;

watch(pair, (newPair, oldPair) => {
  if (unwatchPrice) {
    unwatchPrice();
    unwatchPrice = null;
  }
  if (newPair) {
    unwatchPrice = watchPrice(newPair, (price) => {
      currentPrice.value = price;
    });
  }
});

// Lifecycle hooks
onMounted(() => {
  // Any additional setup can go here
});

onUnmounted(() => {
  if (unwatchPrice) {
    unwatchPrice();
  }
});
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="8">
        <v-form @submit.prevent="calculate">
          <v-select
            v-model="tradingMode"
            :items="['One-way', 'Hedge']"
            label="Trading Mode"
          ></v-select>
          <v-text-field
            v-model="slotNumber"
            label="Slot Number"
            type="number"
          ></v-text-field>
          <v-text-field
            v-model="apiSecret"
            label="API Secret"
            type="password"
          ></v-text-field>
          <v-text-field
            v-model.number="stopLossPercent"
            label="Stop Loss Percentage"
            type="number"
            step="0.01"
          ></v-text-field>
          <v-text-field
            v-model.number="stopLossDollar"
            label="Stop Loss in Dollar"
            type="number"
            step="0.01"
          ></v-text-field>
          <v-text-field
            v-model.number="slPrice"
            label="SL Price"
            type="number"
            step="0.00000001"
          ></v-text-field>
          <v-text-field
            v-model.number="leverage"
            label="Leverage"
            type="number"
          ></v-text-field>
          <v-slider
            v-model="rr"
            label="Reward to Risk Ratio"
            min="1"
            max="10"
            step="1"
            thumb-label
          ></v-slider>
          <v-autocomplete
            v-model="pair"
            :items="ticker"
            label="Ticker"
            :loading="isTickerLoading"
            :error-messages="tickerError"
          ></v-autocomplete>
          <v-text-field
            v-model="currentPrice"
            label="Current Price"
            readonly
            class="mt-4"
          ></v-text-field>
          <v-btn-toggle v-model="position" mandatory>
            <v-btn value="buy">Buy</v-btn>
            <v-btn value="sell">Sell</v-btn>
          </v-btn-toggle>
          <v-btn type="submit" color="primary" class="mt-4">Add trade</v-btn>
          <v-btn @click="sendOrder" color="success" class="mt-4 ml-2"
            >Send Order</v-btn
          >
          <v-btn @click="closeTrade" color="error" class="mt-4 ml-2"
            >Close Trade</v-btn
          >
        </v-form>
        <v-textarea
          v-model="text"
          label="Trade Command"
          readonly
          rows="2"
          class="mt-4"
        ></v-textarea>
        <v-btn @click="copyToClipboard(text)" color="primary" small
          >Copy to clipboard</v-btn
        >
        <v-textarea
          v-model="reduceText"
          label="Reduce Command"
          readonly
          rows="2"
          class="mt-4"
        ></v-textarea>
        <v-btn @click="copyToClipboard(reduceText)" color="primary" small
          >Copy to clipboard</v-btn
        >
        <v-textarea
          v-model="beText"
          label="Breakeven Command"
          readonly
          rows="2"
          class="mt-4"
        ></v-textarea>
        <v-btn @click="copyToClipboard(beText)" color="primary" small
          >Copy to clipboard</v-btn
        >
        <v-textarea
          v-model="slText"
          label="Stop Loss Command"
          readonly
          rows="2"
          class="mt-4"
        ></v-textarea>
        <v-btn @click="copyToClipboard(slText)" color="primary" small
          >Copy to clipboard</v-btn
        >
      </v-col>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Trade History</v-card-title>
          <v-list>
            <v-list-item
              v-for="(trade, index) in trades"
              :key="index"
              @click="handleLoadTrade(trade)"
            >
              <v-list-item-content>
                {{ trade.datetime }} - {{ trade.pair }}
              </v-list-item-content>
              <v-list-item-action>
                <v-btn icon small @click.stop="deleteTrade(index)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
          <v-btn @click="clearTrades" color="warning" class="mt-2"
            >Clear History</v-btn
          >
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
