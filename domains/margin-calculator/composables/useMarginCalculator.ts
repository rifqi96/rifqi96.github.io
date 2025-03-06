// composables/useMarginCalculator.ts
import type { SymbolData, Trade } from "@/domains/margin-calculator/types";
import {
  fetchTickersList,
  watchPrice as watchPriceApi,
  getMinMaxLotSize as getLotSize,
} from "@/domains/margin-calculator/services/binanceApi";
import {
  generateCommand as generateCommandUtil,
  generateReduceCommand as generateReduceCommandUtil,
  generateBeCommand as generateBeCommandUtil,
  generateSLCommand,
} from "@/domains/margin-calculator/utils/commandGenerators";
import { useAuth } from "@/domains/auth/composables/useAuth";
import { useOptions } from "@/composables/useOptions";

export function useMarginCalculator() {
  const config = useRuntimeConfig();

  // Import the options composable
  const { getOptionValue } = useOptions();

  // Core state
  const slot = ref<string>("");
  const apiSecret = ref<string>("");
  const text = ref<string>("");
  const reduceText = ref<string>("");
  const beText = ref<string>("");
  const slText = ref<string>("");
  const position = ref<string>("POSITION");
  const positionCmd = ref<string>("POSITION");
  const positionReduce = ref<string>("POSITION");
  const positionH = ref<string>("-");
  const tpsl = ref<string>("tpsl");
  const rr = ref<number>(4);
  const formReady = ref<boolean>(false);
  const pair = ref<string>("PAIR");
  const socket = ref<WebSocket | null>(null);
  const symbolsData = ref<SymbolData[]>([]);
  const leverage = ref<number>(0);
  const price = ref<number>(0);
  const orders = ref<string[][]>([]);
  const mode = ref<string>("one-way");
  const stopLossPercent = ref<number>(0);
  const stopLossDollar = ref<number>(0);
  const reduceAmount = ref<number>(0);
  const slPrice = ref<number | null>(null);
  const smPrice = ref<number | null>(null);
  const tickers = ref<string[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const maxCommands = 3;

  // Trade history state
  const trades = ref<Trade[]>([]);

  // Authentication state
  const { isAuthenticated, isWhitelisted } = useAuth();
  const authProvider = ref<{
    requireAuth: () => Promise<boolean>;
  } | null>(null);

  // Initialize authentication
  const authenticate = async () => {
    // First, try to load configuration from Supabase options
    try {
      const [defaultSlot, defaultSecret] = await Promise.all([
        getOptionValue("MC_ALEEERT_DEFAULT_SLOT"),
        getOptionValue("MC_ALEEERT_DEFAULT_API_SECRET"),
      ]);

      // Set the values from Supabase, or fall back to environment variables
      slot.value = defaultSlot || config.public.mcAleeertDefaultSlot || "";
      apiSecret.value =
        defaultSecret || config.public.mcAleeertDefaultSecret || "";
    } catch (err) {
      console.error("Failed to load options from Supabase:", err);
      // Fall back to environment variables
      slot.value = config.public.mcAleeertDefaultSlot || "";
      apiSecret.value = config.public.mcAleeertDefaultSecret || "";
    }

    // Check if user is authenticated and whitelisted
    if (!isAuthenticated.value || !isWhitelisted.value) {
      // Use the auth provider to show login dialog or redirect
      if (authProvider.value) {
        await authProvider.value.requireAuth();
      } else {
        // Fall back to old password authentication if auth provider is not available
        const shouldUsePassword = config.public.mcRequiresPassword;

        if (shouldUsePassword) {
          let password = prompt(
            "Please enter the password to access this page:",
          );
          while (password !== "satuduatiga") {
            alert("Wrong password! Please try again.");
            password = prompt("Please enter the password to access this page:");
          }
        }
      }
    }
  };

  const fetchTickers = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const fetchedTickers = await fetchTickersList();
      tickers.value = fetchedTickers;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch tickers";
      console.error(error.value);
    } finally {
      isLoading.value = false;
    }
  };

  // Watch a ticker price in real-time
  const watchPrice = (symbol: string) => {
    if (socket.value) {
      socket.value.close();
    }

    socket.value = new WebSocket(
      `wss://fstream.binance.com/ws/${symbol.toLowerCase()}@ticker`,
    );

    socket.value.onmessage = (event) => {
      const data = JSON.parse(event.data);
      price.value = parseFloat(data.c);
    };

    pair.value = symbol;
  };

  // Get min/max lot size for a symbol
  const getMinMaxLotSize = (symbol: string) => {
    try {
      const symbolData = symbolsData.value.find(
        (data: { symbol: string }) => data.symbol === symbol,
      );
      if (!symbolData) {
        return { minQty: 0, maxQty: 0 };
      }
      const marketLotSize = (symbolData as any).filters?.find(
        (filter: { filterType: string }) =>
          filter.filterType === "MARKET_LOT_SIZE",
      );
      return {
        minQty: marketLotSize?.minQty || 0,
        maxQty: marketLotSize?.maxQty || 0,
      };
    } catch (error) {
      console.error("getMinMaxLotSize error", error);
      return { minQty: 0, maxQty: 0 };
    }
  };

  // Calculate open price based on SL price and percentage
  const calculateOpenPrice = (
    slPriceValue: number,
    slPercentageValue: number,
    position: string,
  ): number => {
    const slPercentageDecimal = slPercentageValue / 100;

    if (position === "buy" || position === "openlong") {
      return slPriceValue / (1 - slPercentageDecimal);
    } else {
      return slPriceValue / (1 + slPercentageDecimal);
    }
  };

  // Calculate TP price based on open price, SL price, and RR ratio
  const calculateTpPrice = (
    openPrice: number,
    slPrice: number,
    rrRatio: number,
    position: string,
  ): number => {
    const slPercentage = Math.abs(openPrice - slPrice) / openPrice;

    if (position === "buy" || position === "openlong") {
      return openPrice * (1 + slPercentage * rrRatio);
    } else {
      return openPrice * (1 - slPercentage * rrRatio);
    }
  };

  // Generate command for trade
  const generateCommand = (
    pair: string,
    position: string,
    deployedCapital: number,
    rewardPercent: number | string,
    stopLossPercent: number | string,
    leverage: number,
    stopMarketPrice: number | null = null,
  ): string => {
    // Round the deployed capital without decimal places
    const roundedCapital = Math.round(deployedCapital);

    // Determine the price part of the command
    const priceCommand = stopMarketPrice ? `${stopMarketPrice}(SM)` : "market";

    // Format reward and stop loss percentages
    let formattedRewardPercent = rewardPercent;
    let formattedStopLossPercent = stopLossPercent;

    if (rewardPercent !== "-" && typeof rewardPercent === "number") {
      formattedRewardPercent = `${Math.round(rewardPercent * 100) / 100}%`;
    }

    if (stopLossPercent !== "-" && typeof stopLossPercent === "number") {
      formattedStopLossPercent = `${Math.round(stopLossPercent * 100) / 100}%`;
    }

    // If slPrice is present, omit reward and stop loss percentages
    if (slPrice.value !== null) {
      return `${pair}(x${leverage}), ${position}, $${roundedCapital}, ${priceCommand}`;
    } else {
      return `${pair}(x${leverage}), ${position}, $${roundedCapital}, ${priceCommand}|${formattedRewardPercent}|${formattedStopLossPercent}`;
    }
  };

  // Generate reduce command
  const generateReduceCommand = (
    pair: string,
    position: string,
    reduceAmount: number,
    leverage: number,
  ): string => {
    return `${pair}(x${leverage}), ${position}, $${Math.round(
      reduceAmount,
    )}, market`;
  };

  // Generate breakeven command
  const generateBeCommand = (
    pair: string,
    tpsl: string,
    positionH: string,
  ): string => {
    return `${pair}, ${tpsl}, ${positionH}, - | 0%(100%)`;
  };

  // Generate SL command
  const generateSlCommand = (
    pair: string,
    tpsl: string,
    positionH: string,
    slPriceValue: number,
    tpPrice: number,
    contractsAmount: number,
  ): string => {
    const amountString = contractsAmount.toFixed(10);
    return generateSLCommand(
      pair,
      tpsl,
      positionH,
      slPriceValue,
      tpPrice,
      contractsAmount,
      leverage.value,
    );
  };

  // Function to update position commands based on current mode and position
  const updatePositionCommands = () => {
    if (position.value === "buy") {
      if (mode.value === "hedge") {
        positionCmd.value = "openlong";
        positionReduce.value = "closelong";
        positionH.value = "long";
        tpsl.value = "tpsl_h";
      } else {
        positionCmd.value = "buy";
        positionReduce.value = "sell";
        positionH.value = "-";
        tpsl.value = "tpsl";
      }
    } else if (position.value === "sell") {
      if (mode.value === "hedge") {
        positionCmd.value = "openshort";
        positionReduce.value = "closeshort";
        positionH.value = "short";
        tpsl.value = "tpsl_h";
      } else {
        positionCmd.value = "sell";
        positionReduce.value = "buy";
        positionH.value = "-";
        tpsl.value = "tpsl";
      }
    }
  };

  // Main calculation function
  const calculate = (event?: Event, buttonType?: string) => {
    // Handle position setting - either from event or direct parameter
    if (
      buttonType === "buy" ||
      (event &&
        event.target &&
        (event.target as HTMLButtonElement).textContent?.trim() === "Buy")
    ) {
      position.value = "buy";
      updatePositionCommands();
    } else if (
      buttonType === "sell" ||
      (event &&
        event.target &&
        (event.target as HTMLButtonElement).textContent?.trim() === "Sell")
    ) {
      position.value = "sell";
      updatePositionCommands();
    }

    // Validate inputs
    if (
      !stopLossPercent.value ||
      !stopLossDollar.value ||
      !leverage.value ||
      stopLossPercent.value <= 0 ||
      stopLossDollar.value <= 0 ||
      leverage.value <= 0
    ) {
      formReady.value = false;
      return;
    }

    // Calculate deployed capital
    const deployedCapital =
      stopLossDollar.value / (stopLossPercent.value / 100) / leverage.value;

    // Additional validation
    if (deployedCapital < stopLossDollar.value) {
      formReady.value = false;
      return;
    }

    // Calculate reward percentage
    const rewardPercent = stopLossPercent.value * rr.value;

    // Calculate open price if we have SL price
    const openPrice = smPrice.value
      ? smPrice.value
      : slPrice.value
        ? calculateOpenPrice(
            slPrice.value,
            stopLossPercent.value,
            position.value,
          )
        : null;

    // Calculate TP price if we have open price and SL price
    let tpPrice: number | null = null;
    let contractsAmount: number | null = null;
    if (slPrice.value !== null && openPrice !== null) {
      tpPrice = calculateTpPrice(
        openPrice,
        slPrice.value,
        rr.value,
        position.value,
      );
      contractsAmount = (deployedCapital * leverage.value) / openPrice;
    }

    // Generate command based on whether slPrice is present
    if (slPrice.value !== null) {
      // If slPrice is present, generate command without TP/SL percentages
      text.value = generateCommand(
        pair.value,
        positionCmd.value,
        deployedCapital,
        "-",
        "-",
        leverage.value,
        smPrice.value,
      );

      // Add SL command if we have TP price and contracts amount
      if (tpPrice !== null && contractsAmount !== null) {
        slText.value = generateSlCommand(
          pair.value,
          tpsl.value,
          positionH.value,
          slPrice.value,
          tpPrice,
          contractsAmount,
        );
        text.value += ";\n" + slText.value;
      }
    } else {
      // If slPrice is not present, include TP/SL percentages
      text.value = generateCommand(
        pair.value,
        positionCmd.value,
        deployedCapital,
        rewardPercent,
        stopLossPercent.value,
        leverage.value,
        smPrice.value,
      );
    }

    reduceText.value = generateReduceCommand(
      pair.value,
      positionReduce.value,
      reduceAmount.value,
      leverage.value,
    );

    beText.value = generateBeCommand(pair.value, tpsl.value, positionH.value);

    // Generate orders array for sending to server
    if (
      pair.value !== "PAIR" &&
      (position.value === "buy" || position.value === "sell")
    ) {
      const orderSize = deployedCapital * leverage.value;
      orders.value = [];

      if (orderSize > 0) {
        if (slPrice.value !== null) {
          const firstCommand = generateCommand(
            pair.value,
            positionCmd.value,
            orderSize / leverage.value,
            "-",
            "-",
            leverage.value,
            smPrice.value,
          );

          if (tpPrice !== null && contractsAmount !== null) {
            const secondCommand = generateSlCommand(
              pair.value,
              tpsl.value,
              positionH.value,
              slPrice.value,
              tpPrice,
              contractsAmount,
            );
            orders.value.push([firstCommand, secondCommand]);
          } else {
            orders.value.push([firstCommand]);
          }
        } else {
          const command = generateCommand(
            pair.value,
            positionCmd.value,
            orderSize / leverage.value,
            rewardPercent,
            stopLossPercent.value,
            leverage.value,
            smPrice.value,
          );
          orders.value.push([command]);
        }
      }

      // Organize orders into groups of maxCommands
      const orders2D: string[][] = [];
      let n = 0;
      let i = 0;
      const flatOrders = orders.value.flat();

      flatOrders.forEach((order) => {
        if (n === 0) {
          orders2D.push([]);
        }
        orders2D[i].push(order);
        n++;
        if (n === maxCommands) {
          n = 0;
          i++;
        }
      });

      orders.value = orders2D;
      formReady.value = true;
    }
  };

  // Generate text with or without auth info
  const generateText = (showSecret = false): string => {
    let orderText = "";

    if (orders.value.length > 0) {
      for (let i = 0; i < orders.value.length; i++) {
        for (let j = 0; j < orders.value[i].length; j++) {
          if (showSecret) {
            orderText += `${orders.value[i][j]}, ${slot.value}, ${apiSecret.value};\n`;
          } else {
            orderText += `${orders.value[i][j]}\n`;
          }
          if ((j + 1) % maxCommands === 0) {
            orderText += "\n";
          }
        }
      }
    } else {
      if (showSecret) {
        orderText = `${text.value}, ${slot.value}, ${apiSecret.value}`;
      } else {
        orderText = text.value;
      }
    }

    return orderText;
  };

  const generateReduceTextWithSecret = (showSecret = false): string => {
    let orderText = reduceText.value;
    if (showSecret) {
      orderText += `, ${slot.value}, ${apiSecret.value}`;
    }
    return orderText;
  };

  const generateBeTextWithSecret = (showSecret = false): string => {
    let orderText = beText.value;
    if (showSecret) {
      orderText += `, ${slot.value}, ${apiSecret.value}`;
    }
    return orderText;
  };

  // Copy text to clipboard
  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text).catch((err) => {
      console.error("Could not copy text: ", err);
    });
  };

  // Add a trade to history
  const addTrade = (): void => {
    if (!formReady.value) {
      alert("Error: Please fill in all the fields.");
      return;
    }

    const openPrice = smPrice.value
      ? smPrice.value
      : slPrice.value
        ? calculateOpenPrice(
            slPrice.value,
            stopLossPercent.value,
            position.value,
          )
        : null;

    const tradeData: Trade = {
      datetime: new Date().toLocaleString(),
      pair: pair.value,
      leverage: leverage.value,
      price: price.value,
      position: position.value,
      positionCmd: positionCmd.value,
      positionReduce: positionReduce.value,
      positionH: positionH.value,
      tpsl: tpsl.value,
      rr: rr.value,
      slot: slot.value,
      apiSecret: apiSecret.value,
      text: text.value,
      reduceText: reduceText.value,
      beText: beText.value,
      orders: orders.value,
      mode: mode.value,
      stopLossDollar: stopLossDollar.value,
      stopLossPercent: stopLossPercent.value,
      slPrice: slPrice.value,
      openPrice: openPrice,
      tpPrice:
        slPrice.value && openPrice
          ? calculateTpPrice(openPrice, slPrice.value, rr.value, position.value)
          : null,
      smPrice: smPrice.value,
      reduceAmount: reduceAmount.value,
    };

    // Save to local storage
    const storedTrades = JSON.parse(localStorage.getItem("trades") || "[]");
    storedTrades.unshift(tradeData); // Add to beginning of array instead of pushing to end
    localStorage.setItem("trades", JSON.stringify(storedTrades));

    // Update local state
    trades.value = storedTrades;
  };

  // Clear all trades
  const clearTrades = (): void => {
    localStorage.removeItem("trades");
    trades.value = [];
  };

  // Load trades from storage
  const loadTradeHistory = (): void => {
    const storedTrades = JSON.parse(localStorage.getItem("trades") || "[]");
    trades.value = storedTrades.sort(
      (a: Trade, b: Trade) =>
        new Date(b.datetime).getTime() - new Date(a.datetime).getTime(),
    );
  };

  // Load a specific trade
  const loadTrade = (tradeData: Trade): void => {
    pair.value = tradeData.pair;
    leverage.value = tradeData.leverage;
    price.value = tradeData.price;
    position.value = tradeData.position;
    positionCmd.value = tradeData.positionCmd;
    positionReduce.value = tradeData.positionReduce;
    positionH.value = tradeData.positionH;
    tpsl.value = tradeData.tpsl;
    rr.value = tradeData.rr;
    slot.value = tradeData.slot;
    apiSecret.value = tradeData.apiSecret;
    text.value = tradeData.text;
    reduceText.value = tradeData.reduceText;
    beText.value = tradeData.beText;
    orders.value = tradeData.orders;
    mode.value = tradeData.mode;
    stopLossDollar.value = tradeData.stopLossDollar;
    stopLossPercent.value = tradeData.stopLossPercent;
    slPrice.value = tradeData.slPrice;
    smPrice.value = tradeData.smPrice || null;
    reduceAmount.value = tradeData.reduceAmount;
    formReady.value = true;
  };

  // Delete a trade
  const deleteTrade = (index: number): void => {
    if (confirm("Are you sure you want to delete this trade?")) {
      const storedTrades = JSON.parse(localStorage.getItem("trades") || "[]");
      storedTrades.splice(index, 1);
      localStorage.setItem("trades", JSON.stringify(storedTrades));
      trades.value = storedTrades;
    }
  };

  // Send order to the server
  const sendOrder = (): void => {
    if (!formReady.value) return;

    const messages: string[][] = [];

    // Put slot and apiSecret into the strings
    if (orders.value.length > 0) {
      for (let i = 0; i < orders.value.length; i++) {
        messages.push([]);

        for (let j = 0; j < orders.value[i].length; j++) {
          // Check if slot and apiSecret are already in the string
          if (
            !orders.value[i][j].includes(`${slot.value}, ${apiSecret.value}`)
          ) {
            // If not, add them
            messages[i][j] =
              `${orders.value[i][j]}, ${slot.value}, ${apiSecret.value};`;
          } else {
            messages[i][j] = orders.value[i][j];
          }
        }

        // Ask for confirmation
        const question = `Order #${
          i + 1
        }: You are about to send the following order to the server: ${
          messages[i]
        }. Are you sure?`;

        if (confirm(question)) {
          try {
            // Send to the server
            fetch("https://aleeert.com/api/v1/", {
              method: "POST",
              headers: {
                "Content-Type": "text/plain",
              },
              body: messages[i].join("\n"),
            });
          } catch (error) {
            console.error("Failed to send order:", error);
            alert("Failed to send order. Check console for details.");
          }
        }
      }
    }
  };

  // Close a trade
  const closeTrade = (): void => {
    if (!formReady.value) return;

    let closePercent = 100;

    // Prompt for close percentage
    const promptedPercent = prompt(
      "Please enter the close percent:",
      closePercent.toString(),
    );

    // Validate input
    if (
      promptedPercent === null ||
      promptedPercent === "" ||
      isNaN(Number(promptedPercent)) ||
      Number(promptedPercent) < 0 ||
      Number(promptedPercent) > 100
    ) {
      return;
    }

    closePercent = Number(promptedPercent);

    // Determine close command based on mode
    let closeCmd = "close";
    if (mode.value === "hedge") {
      closeCmd = "close_h";
    }

    const message = `${pair.value}, ${closeCmd}, ${closePercent}%, -, ${slot.value}, ${apiSecret.value}`;

    // Ask for confirmation
    const question = `You are about to send the following order to the server: ${message}. Are you sure?`;

    if (confirm(question)) {
      try {
        // Send to the server
        fetch("https://aleeert.com/api/v1/", {
          method: "POST",
          headers: {
            "Content-Type": "text/plain",
          },
          body: message,
        });
      } catch (error) {
        console.error("Failed to close trade:", error);
        alert("Failed to close trade. Check console for details.");
      }
    }
  };

  // Watch for changes to mode and update position commands accordingly
  watch(mode, () => {
    // When mode changes, update position commands if a position is already selected
    if (position.value === "buy" || position.value === "sell") {
      updatePositionCommands();
      // Recalculate everything to update the commands
      calculate();
    }
  });

  // Watch for changes to slPrice and handle empty case
  watch(
    () => slPrice.value,
    (newVal) => {
      // If slPrice is cleared, recalculate everything
      if (newVal === null || newVal === 0 || String(newVal) === "") {
        slPrice.value = null; // Ensure it's null for consistency
        calculate();
      }
    },
  );

  // Initialize
  onMounted(() => {
    fetchTickers();
    loadTradeHistory();
  });

  return {
    // State
    slot,
    apiSecret,
    text,
    reduceText,
    beText,
    slText,
    position,
    positionCmd,
    positionReduce,
    positionH,
    tpsl,
    rr,
    formReady,
    pair,
    price,
    orders,
    mode,
    stopLossPercent,
    stopLossDollar,
    leverage,
    reduceAmount,
    slPrice,
    smPrice,
    tickers,
    isLoading,
    error,
    trades,
    authProvider,

    // Methods
    authenticate,
    fetchTickers,
    watchPrice,
    getMinMaxLotSize,
    calculate,
    calculateOpenPrice,
    calculateTpPrice,
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
  } as const;
}
