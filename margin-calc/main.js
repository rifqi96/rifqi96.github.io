// Description: This file contains the main logic of the margin calculator
// This file is called from index.html

// Global variables
let slot = 0;
let apiSecret = '';
let text = '';
let position = 'POSITION';
let rr = 4;

console.log('Hello from main.js');

// On dom content loaded
document.addEventListener('DOMContentLoaded', bootstrap);


// Bootstrap the app
function bootstrap() {
  let password = prompt("Please enter the password to access this page:");
  while (password !== "satuduatiga") {
    alert("Wrong password! Please try again.");
    password = prompt("Please enter the password to access this page:");
  }

  // Prompt api secret key and slot dialog box. If the user clicks cancel or closes the dialog box or leaves the input empty, the app will use the default api secret key
  // Else the app will use the api secret key and the slot that the user entered
  slot = prompt("Please enter your slot number (optional):");
  if (!slot) {
    slot = 3;
  }
  apiSecret = prompt("Please enter your API secret key (optional):");
  if (!apiSecret) {
    apiSecret = '3fa7c1ec483bcc7112ccf94552194fe21576d5b8259f49891ef6e5a5aaia2419';
  }
  
  fetchTickersList();

  tickersDropdownBootstrap();

  // Reward to risk ratio slider
  const rrSlider = document.querySelector('#rr');
  rrSlider.addEventListener('input', function() {
    rr = rrSlider.value;
    document.querySelector('#rr-value').textContent = rr;
    calculate();
  });

  // .buy and .sell button event listeners
  const buyButton = document.querySelector('.buy');
  buyButton.addEventListener('click', calculate);
  const sellButton = document.querySelector('.sell');
  sellButton.addEventListener('click', calculate);
}

// List of crypto currencies from binance futures API
// https://fapi.binance.com/fapi/v1/exchangeInfo
// Use above API to fetch the data, use the "assets.symbol" property
// Put the list in the #tickerDropdown with following format <a href="#">{{symbol}}</a>
function fetchTickersList() {
  // Show the progress bar
  const progressBar = document.querySelector('.progress');
  progressBar.style.display = 'block';
  progressBar.style.width = '0%';
  // aria-valuenow is used by screen readers
  progressBar.setAttribute('aria-valuenow', '0');

  // Create a new request
  const request = new XMLHttpRequest();
  // Open a new connection, using the GET request on the URL endpoint
  request.open('GET', 'https://fapi.binance.com/fapi/v1/exchangeInfo', true);
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
      progressBar.setAttribute('aria-valuenow', percentComplete);
    }
  }

  function handleSuccess(res) {
    // Hide the fetching text
    const fetchingText = document.querySelector('.fetching-text');
    fetchingText.style.display = 'none';
    // Hide the progress bar
    progressBar.style.display = 'none';
    const data = JSON.parse(res.response);
    const symbols = data.symbols.map(symbol => symbol.symbol);
    
    const tickerDropdown = document.querySelector('#tickerDropdown');
    symbols.forEach(symbol => {
      const option = document.createElement('a');
      option.className = 'ticker';
      option.href = '#';
      option.text = symbol;
      tickerDropdown.appendChild(option);
    });
  }

  function handleError(error) {
    // Handle error
    console.log ('Failed to load the data', error);
    // Change fetching text to error text
    const fetchingText = document.querySelector('.fetching-text');
    fetchingText.textContent = 'Failed to load the data';
    // Give error text a bootstrap error class
    fetchingText.classList.add('text-danger');
  }

  request.send();
}

// Bootstrap the tickers dropdown
function tickersDropdownBootstrap() {
  // Make the dropdown list appear when the input is clicked and type something
  const ticker = document.querySelector('#ticker');
  ticker.addEventListener('click', function() {
    tickerDropdown.style.display = 'block';
  });
  ticker.addEventListener('keyup', function() {
    tickerDropdown.style.display = 'block';
  });
  // Make the dropdown list disappear when the input is clicked and type something
  document.addEventListener('click', function(event) {
    if (event.target.id !== 'ticker') {
      tickerDropdown.style.display = 'none';
    }
  });

  // Make the dropdown list clickable and put the selected value in the input
  const tickerDropdown = document.querySelector('#tickerDropdown');
  tickerDropdown.addEventListener('click', function(event) {
    const ticker = event.target;
    if (ticker.classList.contains('ticker')) {
      document.getElementById("ticker").value = ticker.text;
      calculate();
    }
  });

  // Make the dropdown list selection keyboard accessible
  ticker.addEventListener('keydown', function(event) {
    const tickerDropdown = document.querySelector('#tickerDropdown');
    const tickerDropdownItems = tickerDropdown.querySelectorAll('.ticker');
    const activeItem = tickerDropdown.querySelector('.active');
    let activeItemIndex = 0;
    if (activeItem) {
      activeItemIndex = Array.from(tickerDropdownItems).indexOf(activeItem);
    }
    if (event.key === 'ArrowDown') {
      if (activeItem) {
        activeItem.classList.remove('active');
      }
      if (activeItemIndex < tickerDropdownItems.length - 1) {
        tickerDropdownItems[activeItemIndex + 1].classList.add('active');
      } else {
        tickerDropdownItems[0].classList.add('active');
      }
    } else if (event.key === 'ArrowUp') {
      if (activeItem) {
        activeItem.classList.remove('active');
      }
      if (activeItemIndex > 0) {
        tickerDropdownItems[activeItemIndex - 1].classList.add('active');
      } else {
        tickerDropdownItems[tickerDropdownItems.length - 1].classList.add('active');
      }
    } else if (event.key === 'Enter') {
      if (activeItem) {
        document.getElementById("ticker").value = activeItem.text;
        calculate();
      }
    }
  });
}

// https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
function copyToClipboard() {
  text += `, ${apiSecret}`;
  copyTextToClipboard(text);
}
// https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
function copyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Copying text command was ' + msg);
  } catch (err) {
    console.log('Oops, unable to copy');
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

// The main calculate function
function calculate(event) {
  const stopLossPercent = document.getElementById("stop-loss-percent").value;
  const stopLossDollar = document.getElementById("stop-loss-dollar").value;
  const leverage = document.getElementById("leverage").value;
  // Change the buy/sell button text to have biggger font size and bold when it's clicked.
  // Change back to normal when the other button is clicked.
  if (event && event.target.innerHTML === "Buy") {
    event.target.innerHTML = "BUY";
    event.target.style.fontSize = "20px";
    event.target.style.fontWeight = "bold";
    document.querySelector("button.sell").innerHTML = "Sell";
    document.querySelector("button.sell").style.fontSize = "16px";
    document.querySelector("button.sell").style.fontWeight = "normal";
    position = 'buy';
    document.getElementById("trade-text").value = text;
  } else if (event && event.target.innerHTML === "Sell") {
    event.target.innerHTML = "SELL";
    event.target.style.fontSize = "20px";
    event.target.style.fontWeight = "bold";
    document.querySelector("button.buy").innerHTML = "Buy";
    document.querySelector("button.buy").style.fontSize = "16px";
    document.querySelector("button.buy").style.fontWeight = "normal";
    position = 'sell';
    document.getElementById("trade-text").value = text;
  }

  if (!stopLossPercent || !stopLossDollar || !leverage) {
    document.getElementById("error-message").innerHTML = "Error: Please fill in all the fields.";
    document.getElementById("error-message").style.display = "block";
    document.getElementById("result").style.display = "none";
    text = '';
    document.getElementById("trade-text").value = text;
    return;
  }
  const deployedCapital = stopLossDollar / (stopLossPercent / 100) / leverage;

  if (deployedCapital < stopLossDollar) {
    document.getElementById("error-message").innerHTML =
      "Error: The deployed capital is lower than the stop loss dollar.";
    document.getElementById("error-message").style.display = "block";
    document.getElementById("result").style.display = "none";
    text = '';
    document.getElementById("trade-text").value = text;
    // Disable copy to clipboard button when there's an error.
    document.querySelector("button.copy-to-clipboard").disabled = true;
  } else {
    // https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
    document.getElementById("result").innerHTML = "The capital to deploy for the trade with leverage " + leverage +
      " is: $" + deployedCapital.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    document.getElementById("result").style.display = "block";
    document.getElementById("error-message").style.display = "none";
    // Get pair from the ticker input.
    // Else if the ticker input is empty, use the word 'PAIR'
    const pair = document.getElementById("ticker").value ? document.getElementById("ticker").value : 'PAIR';
    const rewardPercent = stopLossPercent * rr;
    console.log(rewardPercent, stopLossPercent, rr);
    text = `${pair}(x${leverage}), ${position}, $${deployedCapital}, market|${rewardPercent}%|${stopLossPercent}%, ${slot}`;
    document.getElementById("trade-text").value = text;
    // Enable copy to clipboard button when there's no error.
    document.querySelector("button.copy-to-clipboard").disabled = false;
  }
}