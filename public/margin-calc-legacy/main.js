// Description: This file contains the main logic of the margin calculator
// This file is called from index.html

// Global variables
let slot = 0;
let apiSecret = "";
let text = "";
let reduceText = "";
let beText = "";
let slText = "";
let position = "POSITION";
let positionCmd = "POSITION";
let positionReduce = "POSITION";
let positionH = "-";
let tpsl = "tpsl";
let rr = 8;
let formReady = false;
let pair = "PAIR";
let socket;
let symbolsData;
let leverage;
let price;
let orders = [];
let mode = "hedge"; // one-way or hedge
let stopLossPercent = 0;
let stopLossDollar = 0;
let reduceAmount = 0;
let slPrice = null;
let smPrice = null;
const maxCommands = 3;

// On dom content loaded
document.addEventListener("DOMContentLoaded", bootstrap);

// Bootstrap the app
function bootstrap() {
  fetchTickersList();

  tickersDropdownBootstrap();

  registerEvents();

  loadTradeHistory();
}

// Event Listenders
/**
 * Sets up event listeners for various UI elements.
 * Includes listeners for trading mode changes, reward-to-risk ratio updates, and button clicks.
 */
function registerEvents() {
  // Trading mode -- dropdown
  const tradingMode = document.querySelector("#mode");
  tradingMode.addEventListener("change", function () {
    mode = tradingMode.value;
    calculate();
  });

  // Reward to risk ratio slider
  const rrSlider = document.querySelector("#rr");
  rrSlider.addEventListener("input", function () {
    rr = rrSlider.value;
    document.querySelector("#rr-value").textContent = rr;
    calculate();
  });

  // .buy and .sell button event listeners
  const buyButton = document.querySelector(".buy");
  buyButton.addEventListener("click", calculate);
  const sellButton = document.querySelector(".sell");
  sellButton.addEventListener("click", calculate);

  // .send-order button event listener
  const sendOrderBtn = document.querySelector(".send-order");
  sendOrderBtn.addEventListener("click", sendOrder);

  // .close-trade button event listener
  const closeTradeBtn = document.querySelector(".close-trade");
  closeTradeBtn.addEventListener("click", closeTrade);

  // Event listener for the "Add Trade" button
  document
    .getElementById("add-trade-button")
    .addEventListener("click", addTrade);

  // Event listener for the "Clear Trades" button
  document
    .getElementById("clear-trades-button")
    .addEventListener("click", clearTrades);
}

function getAuthInfo() {
  const slotInput = document.getElementById("slot");
  const apiSecretInput = document.getElementById("apiSecret");

  slot = slotInput.value || "15";
  apiSecret =
    apiSecretInput.value ||
    "3fa7c1ec483bcc7112ccf94552194fe21576d5b8259f49891ef6e5a5aaia2419";
}

/**
 * Adds the current trade to the trade history and updates the UI.
 * Validates that all required fields are filled before adding the trade.
 */
function addTrade() {
  // Check if all fields are filled
  if (!formReady) {
    alert("Error: Please fill in all the fields.");
    return;
  }

  const openPrice = smPrice
    ? parseFloat(smPrice)
    : slPrice
      ? calculateOpenPrice(slPrice, stopLossPercent, position)
      : null;

  const tradeData = {
    datetime: new Date().toLocaleString(),
    pair: pair,
    leverage: leverage,
    price: price,
    position: position,
    positionCmd: positionCmd,
    positionReduce: positionReduce,
    positionH: positionH,
    tpsl: tpsl,
    rr: rr,
    slot: slot,
    apiSecret: apiSecret,
    text: text,
    reduceText: reduceText,
    beText: beText,
    orders: orders,
    mode: mode,
    stopLossDollar: stopLossDollar,
    stopLossPercent: stopLossPercent,
    slPrice: slPrice,
    openPrice: openPrice,
    tpPrice:
      slPrice && openPrice
        ? calculateTpPrice(openPrice, parseFloat(slPrice), rr, position)
        : null,
    smPrice: smPrice || null,
    reduceAmount: reduceAmount,
  };
  saveTrade(tradeData);
  loadTradeHistory();
}

// Function to clear trades
function clearTrades() {
  localStorage.removeItem("trades");
  loadTradeHistory();
}

// Function to save trade to local storage
function saveTrade(tradeData) {
  const trades = JSON.parse(localStorage.getItem("trades")) || [];
  trades.push(tradeData);
  localStorage.setItem("trades", JSON.stringify(trades));
}

/**
 * Loads and displays the trade history in the UI.
 * Sorts trades by datetime in descending order.
 */
function loadTradeHistory() {
  console.log("loadTradeHistory");
  let trades = JSON.parse(localStorage.getItem("trades")) || [];

  // Sorting trades by datetime in descending order
  trades = trades.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

  const tradeHistoryList = document.getElementById("trade-history-list");
  tradeHistoryList.innerHTML = "";
  trades.forEach((trade, index) => {
    const li = document.createElement("li");
    const smPriceText = trade.smPrice ? ` ${trade.smPrice}(SM)` : "";
    let tradeText = `Trade ${trade.datetime}: ${trade.text}${smPriceText}`;

    if (trade.slPrice) {
      const openPriceText = trade.openPrice
        ? `Open: ${trade.openPrice.toFixed(2)}, `
        : "";
      const tpPriceText = trade.tpPrice ? `${trade.tpPrice.toFixed(2)}/` : "";
      tradeText += `\n${openPriceText}TP/SL: ${tpPriceText}${trade.slPrice}`;
    }

    li.textContent = tradeText;
    li.addEventListener("click", () => loadTrade(trade));

    // Adding delete button for each trade
    const deleteButton = document.createElement("button");
    deleteButton.className = "btn btn-danger btn-sm ml-2";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteTrade(index));
    li.appendChild(deleteButton);

    tradeHistoryList.appendChild(li);
  });
}

// Function to delete a specific trade
function deleteTrade(index) {
  let trades = JSON.parse(localStorage.getItem("trades")) || [];
  trades.splice(trades.length - 1 - index, 1);
  localStorage.setItem("trades", JSON.stringify(trades));
  loadTradeHistory();
}

/**
 * Loads a previously saved trade and populates the UI with its details.
 *
 * @param {Object} tradeData - The data of the trade to be loaded
 */
function loadTrade(tradeData) {
  console.log("loadTrade");
  pair = tradeData.pair;
  leverage = tradeData.leverage;
  price = tradeData.price;
  position = tradeData.position;
  positionCmd = tradeData.positionCmd;
  positionReduce = tradeData.positionReduce;
  positionH = tradeData.positionH;
  tpsl = tradeData.tpsl;
  rr = tradeData.rr;
  slot = tradeData.slot;
  apiSecret = tradeData.apiSecret;
  text = tradeData.text;
  reduceText = tradeData.reduceText;
  beText = tradeData.beText;
  orders = tradeData.orders;
  mode = tradeData.mode;
  stopLossDollar = tradeData.stopLossDollar;
  stopLossPercent = tradeData.stopLossPercent;
  slPrice = tradeData.slPrice;
  smPrice = tradeData.smPrice || null;
  reduceAmount = tradeData.reduceAmount;
  formReady = true;

  // Update the UI
  document.querySelector("#mode").value = mode;
  document.querySelector("#stop-loss-percent").value = stopLossPercent;
  document.querySelector("#stop-loss-dollar").value = stopLossDollar;
  document.querySelector("#sl-price").value = slPrice;
  document.getElementById("sm-price").value = smPrice || "";
  document.querySelector("#leverage").value = leverage;
  document.querySelector("#rr").value = rr;
  document.querySelector("#rr-value").textContent = rr;
  document.querySelector("#ticker").value = pair;
  document.querySelector("#reduce-trade-amount").value = reduceAmount;

  // Update the UI for the position
  if (position === "buy") {
    document.querySelector(".buy").click();
  } else if (position === "sell") {
    console.log("sell");
    document.querySelector(".sell").click();
  }
}

/**
 * Fetches the list of available cryptocurrency tickers from the Binance API.
 * Updates the UI with the fetched tickers and handles any errors that occur during the process.
 * https://fapi.binance.com/fapi/v1/exchangeInfo
 * Use above API to fetch the data, use the "assets.symbol" property
 * Put the list in the #tickerDropdown with following format <a href="#">{{symbol}}</a>
 */
function fetchTickersList() {
  // Show the progress bar
  const progressBar = document.querySelector(".progress");
  progressBar.style.display = "block";
  progressBar.style.width = "0%";
  // aria-valuenow is used by screen readers
  progressBar.setAttribute("aria-valuenow", "0");

  // Create a new request
  const request = new XMLHttpRequest();
  // Open a new connection, using the GET request on the URL endpoint
  request.open("GET", "https://fapi.binance.com/fapi/v1/exchangeInfo", true);
  // Handle progress
  request.onprogress = handleOnProgress;
  // Handle successful request
  request.onload = handleOnLoad;
  // Handle network error
  request.onerror = handleError;

  function handleOnLoad(e) {
    const res = this;
    if (res.status >= 200 && res.status < 400) {
      // Successful request
      handleSuccess(res);
    } else {
      // We reached our target server, but it returned an error
      handleError(res);
    }
  }

  function handleOnProgress(e) {
    if (e.lengthComputable) {
      // Update the progress bar width percentage based on the loaded data
      const percentComplete = (e.loaded / e.total) * 100;
      progressBar.style.width = `${percentComplete}%`;
      progressBar.setAttribute("aria-valuenow", percentComplete);
    }
  }

  function handleSuccess(res) {
    // Hide the fetching text
    const fetchingText = document.querySelector(".fetching-text");
    fetchingText.style.display = "none";
    // Hide the progress bar
    progressBar.style.display = "none";
    const data = JSON.parse(res.response);
    symbolsData = data.symbols;
    const symbols = symbolsData.map((symbol) => symbol.symbol);

    const tickerDropdown = document.querySelector("#tickerDropdown");
    symbols.forEach((symbol) => {
      const option = document.createElement("a");
      option.className = "ticker";
      option.href = "#";
      option.text = symbol;
      tickerDropdown.appendChild(option);
    });
  }

  function handleError(error) {
    // Handle error
    console.log("Failed to load the data", error);
    // Change fetching text to error text
    const fetchingText = document.querySelector(".fetching-text");
    fetchingText.textContent = "Failed to load the data";
    // Give error text a bootstrap error class
    fetchingText.classList.add("text-danger");
  }

  request.send();
}

/**
 * Establishes a WebSocket connection to watch the real-time price of a given symbol.
 * Updates the UI with the current price as it changes.
 *
 * @param {string} symbol - The trading pair symbol to watch (e.g., "BTCUSDT")
 */
function watchPrice(symbol) {
  console.log("watchPrice", symbol);
  if (socket) {
    socket.close();
  }
  socket = new WebSocket(
    `wss://fstream.binance.com/ws/${symbol.toLowerCase()}@ticker`,
  );
  console.log("socket", socket);

  socket.onclose = function (event) {
    console.log("event onclose", event);
  };

  socket.onerror = function (event) {
    console.log("event onerror", event);
  };

  socket.onopen = function (event) {
    console.log("event onopen", event);
  };

  socket.onmessage = function (event) {
    const data = JSON.parse(event.data);
    price = data.c;
    // Update .current-price-value
    const currentPriceValue = document.querySelector(".current-price-value");
    currentPriceValue.textContent = price;
  };
}

/**
 * Retrieves the minimum and maximum lot size for a given symbol from the cached symbol data.
 * Get min and max MARKET_LOT_SIZE of the symbol
 * The MARKET_LOT_SIZE is from the tickers list
 *
 * @param {string} symbol - The trading pair symbol
 * @returns {Object} An object containing minQty and maxQty
 */
//
function getMinMaxLotSize(symbol) {
  try {
    if (!symbolsData) {
      return { minQty: 0, maxQty: 0 };
    }
    const symbolData = symbolsData.find(
      (symbolData) => symbolData.symbol === symbol,
    );
    if (!symbolData) {
      return { minQty: 0, maxQty: 0 };
    }
    const filters = symbolData.filters || [];
    const marketLotSize = filters.find(
      (filter) => filter.filterType === "MARKET_LOT_SIZE",
    );
    const minQty = marketLotSize.minQty;
    const maxQty = marketLotSize.maxQty;
    return { minQty, maxQty };
  } catch (error) {
    console.log("getMinMaxLotSize error", error);
    return { minQty: 0, maxQty: 0 };
  }
}

function getOrderLotSize(price, leverage) {
  const orderLotSize = price * leverage;
  return orderLotSize;
}

function isEligibleForMinLotSize(orderLotSize, minQty) {
  return orderLotSize >= minQty;
}

function isEligibleForMaxLotSize(orderLotSize, maxQty) {
  return orderLotSize <= maxQty;
}

// Bootstrap the tickers dropdown
function tickersDropdownBootstrap() {
  // Make the dropdown list appear when the input is clicked and type something
  const ticker = document.querySelector("#ticker");
  ticker.addEventListener("click", function () {
    tickerDropdown.style.display = "block";
  });
  ticker.addEventListener("keyup", function () {
    tickerDropdown.style.display = "block";
  });
  // Make the dropdown list disappear when the input is clicked and type something
  document.addEventListener("click", function (event) {
    if (event.target.id !== "ticker") {
      tickerDropdown.style.display = "none";
    }
  });

  // Make the dropdown list clickable and put the selected value in the input
  const tickerDropdown = document.querySelector("#tickerDropdown");
  tickerDropdown.addEventListener("click", function (event) {
    const ticker = event.target;
    if (ticker.classList.contains("ticker")) {
      document.getElementById("ticker").value = ticker.text;
      watchPrice(ticker.text);
      calculate();
    }
  });

  // Make the dropdown list selection keyboard accessible
  ticker.addEventListener("keydown", function (event) {
    const tickerDropdown = document.querySelector("#tickerDropdown");
    const tickerDropdownItems = tickerDropdown.querySelectorAll(".ticker");
    const activeItem = tickerDropdown.querySelector(".active");
    let activeItemIndex = 0;
    if (activeItem) {
      activeItemIndex = Array.from(tickerDropdownItems).indexOf(activeItem);
    }
    if (event.key === "ArrowDown") {
      if (activeItem) {
        activeItem.classList.remove("active");
      }
      if (activeItemIndex < tickerDropdownItems.length - 1) {
        tickerDropdownItems[activeItemIndex + 1].classList.add("active");
      } else {
        tickerDropdownItems[0].classList.add("active");
      }
    } else if (event.key === "ArrowUp") {
      if (activeItem) {
        activeItem.classList.remove("active");
      }
      if (activeItemIndex > 0) {
        tickerDropdownItems[activeItemIndex - 1].classList.add("active");
      } else {
        tickerDropdownItems[tickerDropdownItems.length - 1].classList.add(
          "active",
        );
      }
    } else if (event.key === "Enter") {
      if (activeItem) {
        document.getElementById("ticker").value = activeItem.text;
        watchPrice(activeItem.text);
        calculate();
      }
    }
  });
}

// API Interactions
/**
 * Sends the generated order to the trading server.
 * Prompts the user for confirmation before sending each order.
 */
function sendOrder() {
  if (!formReady) return;

  getAuthInfo();

  const messages = [];

  // Send a post request to https://aleeert.com/api/v1/
  // with the message as the raw text body
  // and the Content-Type header set to text/plain
  // but before that, prompt the user to confirm the order with js dialog box
  // and if the user confirms, send the request
  // and if the user cancels, do nothing
  // Loop through the orders and add them to the messages array
  if (orders.length > 0) {
    // Put in slot and apiSecret to the string in the orders array
    for (let i = 0; i < orders.length; i++) {
      messages.push(orders[i]);

      for (let j = 0; j < orders[i].length; j++) {
        // Check if slot and apiSecret are already in the string
        // Combine slot and apiSecret with a comma and a space first before checking
        if (orders[i][j].indexOf(`${slot}, ${apiSecret}`) === -1) {
          // If slot and apiSecret are not in the string, add them
          messages[i][j] = `${orders[i][j]}, ${slot}, ${apiSecret};`;
        }
      }

      const question = `Order #${
        i + 1
      }: You are about to send the following order to the server: ${
        messages[i]
      }. Are you sure?`;
      if (confirm(question)) {
        const request = new XMLHttpRequest();
        request.open("POST", "https://aleeert.com/api/v1/", true);
        request.setRequestHeader("Content-Type", "text/plain");
        request.send(messages[i].join("\n"));
      }
    }
  }
}

function closeTrade() {
  if (!formReady) return;
  getAuthInfo();
  let closePercent = 100;

  // prompt the user to fill in the close percent
  // and if the user confirms, send the request
  // and if the user cancels, do nothing
  const question = "Please enter the close percent:";
  closePercent = prompt(question, closePercent);
  // Close percent must be a number between 0 and 100
  // Do nothing if the user cancels
  // Validate in one line
  if (
    closePercent === null ||
    closePercent === "" ||
    isNaN(closePercent) ||
    closePercent < 0 ||
    closePercent > 100
  )
    return;

  let closeCmd = "close";
  if (mode === "hedge") {
    closeCmd = "close_h";
  }

  const message = `${pair}, ${closeCmd}, ${closePercent}%, -, ${slot}, ${apiSecret}`;

  // Send a post request to https://aleeert.com/api/v1/
  // with the message as the raw text body
  // and the Content-Type header set to text/plain
  // but before that, prompt the user to confirm the order with js dialog box
  // and if the user confirms, send the request
  // and if the user cancels, do nothing
  const question2 = `You are about to send the following order to the server: ${message}. Are you sure?`;
  if (confirm(question2)) {
    const request = new XMLHttpRequest();
    request.open("POST", "https://aleeert.com/api/v1/", true);
    request.setRequestHeader("Content-Type", "text/plain");
    request.send(message);
  }
}

// Utility functions
/**
 * Copies the given text to the clipboard.
 *
 * @see https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
 * @param {string} text - The text to be copied to the clipboard
 */
function copyToClipboard() {
  getAuthInfo();
  const generatedText = generateText(true);

  copyTextToClipboard(generatedText);
}

function copyReduceToClipboard() {
  getAuthInfo();
  const generatedText = generateReduceText(true);

  copyTextToClipboard(generatedText);
}

function copyBeToClipboard() {
  getAuthInfo();
  const generatedText = generateBeText(true);

  copyTextToClipboard(generatedText);
}

/**
 * Generates the text representation of the current trade or orders.
 *
 * @param {boolean} showSecret - Whether to include the slot and API secret in the generated text
 * @returns {string} The generated text representation of the trade(s)
 */
function generateText(showSecret = false) {
  // Check if orders array is not empty
  // Loop through and combine the slot and apiSecret with the orders
  // and copy the combined text to the clipboard
  let orderText = "";
  // Check if orders array is not empty
  if (orders.length > 0) {
    for (let i = 0; i < orders.length; i++) {
      for (let j = 0; j < orders[i].length; j++) {
        if (showSecret) {
          orderText += `${orders[i][j]}, ${slot}, ${apiSecret};\n`;
        } else {
          orderText += `${orders[i][j]}\n`;
        }
        if ((j + 1) % maxCommands === 0) {
          orderText += "\n";
        }
      }
    }
  }
  // If orders array is empty, use the text variable
  else {
    if (showSecret) {
      orderText = `${text}, ${slot}, ${apiSecret}`;
    } else {
      orderText = text;
    }
  }
  return orderText;
}

function generateReduceText(showSecret = false) {
  let orderText = reduceText;
  if (showSecret) {
    orderText += `, ${slot}, ${apiSecret}`;
  }
  return orderText;
}

function generateBeText(showSecret = false) {
  let orderText = beText;
  if (showSecret) {
    orderText += `, ${slot}, ${apiSecret}`;
  }
  return orderText;
}

// https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
function copyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand("copy");
    var msg = successful ? "successful" : "unsuccessful";
    console.log("Copying text command was " + msg);
  } catch (err) {
    console.log("Oops, unable to copy");
  }

  document.body.removeChild(textArea);
}

// https://www.w3schools.com/howto/howto_js_filter_lists.asp
function filterFunction() {
  var input, filter, ul, li, a, i;
  input = document.getElementById("ticker");
  filter = input.value.toUpperCase();
  div = document.getElementById("tickerDropdown");
  a = div.getElementsByTagName("a");
  for (i = 0; i < a.length; i++) {
    if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = "";
    } else {
      a[i].style.display = "none";
    }
  }
}

/**
 * Generates a aleeert command string based on the provided parameters.
 *
 * @param {string} pair - The trading pair
 * @param {string} position - The position type (e.g., "buy", "sell")
 * @param {number} deployedCapital - The amount of capital to deploy
 * @param {number} rewardPercent - The reward percentage
 * @param {number|string} stopLossPercent - The stop loss percentage or "-" if not applicable
 * @param {number} leverage - The leverage to be used
 * @param {number|null} smPrice - The stop market price (if applicable)
 * @returns {string} The generated trading command
 */
function generateCommand(
  pair,
  position,
  deployedCapital,
  rewardPercent,
  stopLossPercent,
  leverage,
  stopMarketPrice = smPrice, // Default value is the global variable smPrice
) {
  console.log(
    "generateCommand",
    pair,
    position,
    deployedCapital,
    rewardPercent,
    stopLossPercent,
    leverage,
    stopMarketPrice,
  );
  if (stopLossPercent !== "-") {
    stopLossPercent = `${Math.round(stopLossPercent * 100) / 100}%`;
  }

  // Round the deployed capital to without decimal places
  deployedCapital = Math.round(deployedCapital);

  // Determine the price part of the command
  let priceCommand = stopMarketPrice ? `${stopMarketPrice}(SM)` : "market";

  // If slPrice is present, omit rewardPercent and stopLossPercent
  if (slPrice) {
    return `${pair}(x${leverage}), ${position}, $${deployedCapital}, ${priceCommand}`;
  } else {
    // Round the reward and stop loss percent to 2 decimal places
    rewardPercent = `${Math.round(rewardPercent * 100) / 100}%`;
    return `${pair}(x${leverage}), ${position}, $${deployedCapital}, ${priceCommand}|${rewardPercent}|${stopLossPercent}`;
  }
}

function generateReduceCommand(pair, position, reduceAmount, leverage) {
  console.log("generateReduceCommand", pair, position, reduceAmount, leverage);
  return `${pair}(x${leverage}), ${position}, $${reduceAmount}, market`;
}

function generateBeCommand(pair, tpsl, positionH) {
  console.log("generateBeCommand", pair, tpsl, positionH);
  return `${pair}, ${tpsl}, ${positionH}, - | 0%(100%)`;
}

function generateSLCommand(
  pair,
  tpsl,
  positionH,
  slPrice,
  tpPrice,
  contractsAmount,
) {
  console.log(
    "generateSLCommand",
    pair,
    tpsl,
    positionH,
    slPrice,
    tpPrice,
    contractsAmount,
  );
  const amountString = contractsAmount.toFixed(10);
  const command = `${pair}(x${leverage}), ${tpsl}, ${positionH}, ${tpPrice}(${amountString}) | ${slPrice}(${amountString})`;

  return command;
}

/**
 * Calculates the open price based on the stop loss price and percentage.
 *
 * @param {number} slPrice - The stop loss price
 * @param {number} slPercentage - The stop loss percentage
 * @param {string} position - The position type (e.g., "buy", "sell")
 * @returns {number} The calculated open price
 */
function calculateOpenPrice(slPrice, slPercentage, position) {
  const slPriceValue = parseFloat(slPrice);
  const slPercentageValue = parseFloat(slPercentage) / 100;

  if (position === "buy" || position === "openlong") {
    return slPriceValue / (1 - slPercentageValue);
  } else {
    return slPriceValue / (1 + slPercentageValue);
  }
}

/**
 * Calculates the take profit price based on the open price, stop loss price, and reward-to-risk ratio.
 *
 * @param {number} openPrice - The open price
 * @param {number} slPrice - The stop loss price
 * @param {number} rrRatio - The reward-to-risk ratio
 * @param {string} position - The position type (e.g., "buy", "sell")
 * @returns {number} The calculated take profit price
 */
function calculateTpPrice(openPrice, slPrice, rrRatio, position) {
  const slPercentage = Math.abs(openPrice - slPrice) / openPrice;
  if (position === "buy" || position === "openlong") {
    return openPrice * (1 + slPercentage * rrRatio);
  } else {
    return openPrice * (1 - slPercentage * rrRatio);
  }
}

/**
 * Performs the main calculation based on user inputs and updates the UI accordingly.
 * Generates trading commands and updates the trade history.
 *
 * @param {Event} [event] - The event that triggered the calculation (optional)
 */
function calculate(event) {
  stopLossPercent = document.getElementById("stop-loss-percent").value;
  stopLossDollar = document.getElementById("stop-loss-dollar").value;
  reduceAmount = document.getElementById("reduce-trade-amount").value;
  leverage = document.getElementById("leverage").value;
  slPrice = document.getElementById("sl-price").value;
  smPrice = document.getElementById("sm-price").value || null;

  getAuthInfo();

  // Change the buy/sell button text to have biggger font size and bold when it's clicked.
  // Change back to normal when the other button is clicked.
  if (event && event.target.innerHTML === "Buy") {
    event.target.innerHTML = "BUY";
    event.target.style.fontSize = "20px";
    event.target.style.fontWeight = "bold";
    document.querySelector("button.sell").innerHTML = "Sell";
    document.querySelector("button.sell").style.fontSize = "16px";
    document.querySelector("button.sell").style.fontWeight = "normal";
    position = "buy";
    // Check the hedge mode
    if (mode === "hedge") {
      positionCmd = "openlong";
      positionReduce = "closelong";
      positionH = "long";
      tpsl = "tpsl_h";
    } else {
      positionCmd = "buy";
      positionReduce = "sell";
      positionH = "-";
      tpsl = "tpsl";
    }
    document.getElementById("trade-text").value = text;
    document.getElementById("reduce-trade-text").value = reduceText;
    document.getElementById("be-trade-text").value = beText;
  } else if (event && event.target.innerHTML === "Sell") {
    event.target.innerHTML = "SELL";
    event.target.style.fontSize = "20px";
    event.target.style.fontWeight = "bold";
    document.querySelector("button.buy").innerHTML = "Buy";
    document.querySelector("button.buy").style.fontSize = "16px";
    document.querySelector("button.buy").style.fontWeight = "normal";
    position = "sell";
    // Check the hedge mode
    if (mode === "hedge") {
      positionCmd = "openshort";
      positionReduce = "closeshort";
      positionH = "short";
      tpsl = "tpsl_h";
    } else {
      positionCmd = "sell";
      positionReduce = "buy";
      positionH = "-";
      tpsl = "tpsl";
    }
    document.getElementById("trade-text").value = text;
    document.getElementById("reduce-trade-text").value = reduceText;
    document.getElementById("be-trade-text").value = beText;
  }

  if (
    !stopLossPercent ||
    !stopLossDollar ||
    !leverage ||
    isNaN(stopLossPercent) ||
    isNaN(stopLossDollar) ||
    isNaN(leverage) ||
    stopLossPercent === "" ||
    stopLossDollar === "" ||
    leverage === "" ||
    stopLossPercent <= 0 ||
    stopLossDollar <= 0 ||
    leverage <= 0
  ) {
    document.getElementById("error-message").innerHTML =
      "Error: Please fill in all the fields.";
    document.getElementById("error-message").style.display = "block";
    document.getElementById("result").style.display = "none";
    text = "";
    reduceText = "";
    beText = "";
    document.getElementById("trade-text").value = text;
    document.getElementById("reduce-trade-text").value = reduceText;
    document.getElementById("be-trade-text").value = beText;
    // Disable send order button when there's an error.
    document.querySelector("button.send-order").disabled = true;
    formReady = false;
    return;
  }
  const deployedCapital = stopLossDollar / (stopLossPercent / 100) / leverage;

  // If the deployed capital is lower than the stop loss dollar, show an error message.
  if (deployedCapital < stopLossDollar) {
    document.getElementById("error-message").innerHTML =
      "Error: The deployed capital is lower than the stop loss dollar.";
    document.getElementById("error-message").style.display = "block";
    document.getElementById("result").style.display = "none";
    text = "";
    reduceText = "";
    beText = "";
    document.getElementById("trade-text").value = text;
    document.getElementById("reduce-trade-text").value = reduceText;
    document.getElementById("be-trade-text").value = beText;
    // Disable copy to clipboard button when there's an error.
    document.querySelector("button.copy-to-clipboard").disabled = true;
    document.querySelector("button.copy-reduce-to-clipboard").disabled = true;
    document.querySelector("button.copy-be-to-clipboard").disabled = true;
    // Disable send order button when there's an error.
    document.querySelector("button.send-order").disabled = true;
    // Disable close trade button when there's an error.
    document.querySelector("button.close-trade").disabled = true;
    formReady = false;
  }
  // Show the result.
  else {
    // https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
    document.getElementById("result").innerHTML =
      "The capital to deploy for the trade with leverage " +
      leverage +
      " is: $" +
      deployedCapital.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    document.getElementById("result").style.display = "block";
    document.getElementById("error-message").style.display = "none";
    // Get pair from the ticker input.
    // Else if the ticker input is empty, use the word 'PAIR'
    pair = document.getElementById("ticker").value
      ? document.getElementById("ticker").value
      : "PAIR";
    const rewardPercent = stopLossPercent * rr;
    const slPercent = parseFloat(stopLossPercent) / 100;
    const rrRatio = parseFloat(rr);
    const slPriceValue = parseFloat(slPrice);
    // Use smPrice as openPrice if it's available, otherwise calculate it
    const openPrice = smPrice
      ? parseFloat(smPrice)
      : calculateOpenPrice(slPrice, stopLossPercent, position);
    let tpPrice;
    let contractsAmount;

    if (slPrice) {
      if (position === "buy" || positionCmd === "openlong") {
        tpPrice = openPrice * (1 + slPercent * rrRatio);
      } else {
        tpPrice = openPrice * (1 - slPercent * rrRatio);
      }

      contractsAmount = (deployedCapital * leverage) / openPrice;

      text = generateCommand(
        pair,
        positionCmd,
        deployedCapital,
        "-",
        "-",
        leverage,
        smPrice,
      );
      slText = generateSLCommand(
        pair,
        tpsl,
        positionH,
        slPriceValue,
        tpPrice.toFixed(2),
        contractsAmount,
      );
    } else {
      const rewardPercent = slPercent * rrRatio * 100;
      text = generateCommand(
        pair,
        positionCmd,
        deployedCapital,
        rewardPercent,
        stopLossPercent,
        leverage,
        smPrice,
      );
    }
    reduceText = generateReduceCommand(
      pair,
      positionReduce,
      reduceAmount,
      leverage,
    );
    beText = generateBeCommand(pair, tpsl, positionH);
    if (slPrice) {
      document.getElementById("trade-text").value = text + ";\n" + slText;
    } else {
      document.getElementById("trade-text").value = text;
    }
    document.getElementById("reduce-trade-text").value = reduceText;
    document.getElementById("be-trade-text").value = beText;
    // Enable copy to clipboard button when there's no error.
    document.querySelector("button.copy-to-clipboard").disabled = false;
    document.querySelector("button.copy-reduce-to-clipboard").disabled = false;
    document.querySelector("button.copy-be-to-clipboard").disabled = false;
    // Enable send order button when there's no error.
    // But validate if the position is set to either buy or sell.
    if (position === "buy" || position === "sell") {
      // If the order size is less than minimum order size, disable the send order button.
      const minimumOrderSize = getMinMaxLotSize(pair, "min").minQty || 0;
      if (deployedCapital * leverage < minimumOrderSize) {
        document.querySelector("button.send-order").disabled = true;
      } else {
        document.querySelector("button.send-order").disabled = false;
      }
    }
    // Enable close position button when there's no error.
    // Validate if the pair is not 'PAIR'
    if (pair !== "PAIR") {
      document.querySelector("button.close-trade").disabled = false;
      // tradingviewChartBootstrap(pair);
    }

    // Enable the formReady flag when there's no error.
    // This is used to validate if the form is ready to be submitted to the server.
    // Pair and position are required fields.
    // Pair is validated by the ticker input and position is validated by the buy/sell button.
    // Pair can't be "PAIR" and position can't be "POSITION"
    if (pair !== "PAIR" && (position === "buy" || position === "sell")) {
      // Loop through the deployedCapital size.
      // Then push each order into the orders array.
      // An order is a text using generateCommand()
      let orderSize = deployedCapital * leverage;
      orders = [];
      if (orderSize > 0) {
        if (slPrice) {
          const firstCommand = generateCommand(
            pair,
            positionCmd,
            orderSize / leverage,
            "-",
            "-",
            leverage,
            smPrice || null,
          );
          const secondCommand = generateSLCommand(
            pair,
            tpsl,
            positionH,
            slPriceValue,
            tpPrice.toFixed(2),
            contractsAmount,
          );
          orders.push(firstCommand);
          orders.push(secondCommand);
        } else {
          const command = generateCommand(
            pair,
            positionCmd,
            orderSize / leverage,
            rewardPercent,
            stopLossPercent,
            leverage,
            smPrice || null,
          );
          orders.push(command);
        }
      }

      // Change the orders array structure into 2D array.
      // Each array contains maxCommands items.
      const orders2D = [];
      let n = 0;
      let i = 0;
      orders.forEach((order) => {
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
      orders = orders2D;

      // Print the orders array to the textarea.
      // The textarea is used to display the orders.
      // The textarea is also used to copy the orders to the clipboard.
      // The textarea is also used to send the orders to the server.
      // Each order is separated by a new line.
      // Max command per request is defined in maxCommands const.
      // Add more new lines per max commands.
      const orderText = generateText();
      const reduceOrderText = generateReduceText();
      const beOrderText = generateBeText();
      document.getElementById("trade-text").value = orderText;
      document.getElementById("reduce-trade-text").value = reduceOrderText;
      document.getElementById("be-trade-text").value = beOrderText;
      formReady = true;
    }
  }
}
