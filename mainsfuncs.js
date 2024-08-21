// Web3 Initialization with Infura

// ETH
var web3 = new Web3(
  new Web3.providers.HttpProvider(
    "https://sepolia.infura.io/v3/f4a064381a4145aea1b2bfd4bd620456"
  )
);

// AVAX
var web3AVAX = new Web3(
  "https://avalanche-fuji.infura.io/v3/f4a064381a4145aea1b2bfd4bd620456"
);

/**
 * Function to handle user login.
 */
function login() {
  var username = document.getElementById("loginUsername").value;
  var password = document.getElementById("loginPassword").value;
  var loginResult = document.getElementById("loginResult");

  var allUsers = JSON.parse(localStorage.getItem("userData")) || [];

  // If any user is logged in already, prevent new login
  var loggedInUser = allUsers.find((user) => user.isLoggedIn);
  if (loggedInUser) {
    loginResult.innerText =
      "Another user is already logged in. Logout before logging in.";
    return;
  }

  var user = allUsers.find(
    (user) => user.username === username && user.password === password
  ); // check if its the correct username and password

  if (!user) {
    loginResult.innerText = "Invalid Username or Password";
    return;
  }

  loginResult.innerText = "Login Successful. Redirecting...";
  setTimeout(function () {
    window.location.href = "index.html";
  }, 2000);
  user.isLoggedIn = true;
  localStorage.setItem("userData", JSON.stringify(allUsers));
}

/**
 * Function to handle user logout.
 */
function logOut() {
  var allUsers = JSON.parse(localStorage.getItem("userData")) || [];

  // Find the logged in user and set isLoggedIn to false
  var loggedInUser = allUsers.find((user) => user.isLoggedIn);
  if (loggedInUser) {
    loggedInUser.isLoggedIn = false;
  }

  // Update the localStorage
  localStorage.setItem("userData", JSON.stringify(allUsers));

  // Get the current page URL
  var currentPage = window.location.href;

  // Check if the current page is not the login page
  if (
    currentPage.indexOf("login.html") === -1 &&
    currentPage.indexOf("RestoreAccount.html") === -1
  ) {
    window.location.href = "login.html"; // redirect to login page
  }
}

var keyss = null;

var createAccountForm = document.getElementById("createAccountForm"); // listener method
if (createAccountForm) {
  createAccountForm.addEventListener("submit", function (event) {
    event.preventDefault();
    createAccount();
  });
}

/**
 * Function to create a new account for the wallet.
 */
function createAccount() {
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;
  var seedPhrase = lightwallet.keystore.generateRandomSeed();

  lightwallet.keystore.createVault(
    {
      password: password,
      seedPhrase: seedPhrase,
      hdPathString: "m/44'/60'/0'/0",
    },
    function (err, keyStore) {
      if (err) throw err;

      keyStore.keyFromPassword(password, function (err, pwDerivedKey) {
        if (err) throw err;
        keyStore.generateNewAddress(pwDerivedKey, 1);
        var addr = keyStore.getAddresses()[0];

        var userData = {
          username: username,
          password: password,
          address: addr,
          seedPhrase: seedPhrase,
          isLoggedIn: true,
          serializedKeystore: keyStore.serialize(),
          transactions: [],
        };

        var allUsers = JSON.parse(localStorage.getItem("userData")) || [];

        allUsers.push(userData);
        localStorage.setItem("userData", JSON.stringify(allUsers));

        document.getElementById("accountAddress").innerText =
          "Username: " + username + "\nAccount Address: " + addr;
        document.getElementById("seedPhraseDisplay").innerText = seedPhrase;
      });
    }
  );
}

/**
 * Function to get the balance of the logged-in user's ETH account.
 */
async function getETHBalance() {
  var allUsers = JSON.parse(localStorage.getItem("userData")) || [];
  var loggedInUser = allUsers.find((user) => user.isLoggedIn);

  if (!loggedInUser) {
    console.log("No logged in user found");
    return;
  }

  let balanceWei = await web3.eth.getBalance(loggedInUser.address);
  let balanceEth = web3.utils.fromWei(balanceWei, "ether");

  console.log("Balance: ", balanceEth);
  document.getElementById("walletBalance").innerText = `${balanceEth} ETH`;
}

/**
 * Function to get the balance of the logged-in user's AVAX account.
 */
async function getAVAXBalance() {
  var allUsers = JSON.parse(localStorage.getItem("userData")) || [];
  var loggedInUser = allUsers.find((user) => user.isLoggedIn);

  if (!loggedInUser) {
    console.log("No logged in user found");
    return;
  }

  let balanceWei = await web3AVAX.eth.getBalance(loggedInUser.address);
  let balanceAVAX = web3AVAX.utils.fromWei(balanceWei, "ether");

  console.log("AVAX Balance: ", balanceAVAX);
  document.getElementById("walletBalanceAvax").innerText = `${balanceAVAX} AVAX`;
}

/**
 * Function to get the address of the currently logged-in user.
 */
function getLoggedInUserAddress() {
  var allUsers = JSON.parse(localStorage.getItem("userData")) || [];
  var loggedInUser = allUsers.find((user) => user.isLoggedIn);

  if (!loggedInUser) {
    console.log("No logged in user found");
    return;
  }

  console.log("User Address: ", loggedInUser.address);
  document.getElementById("walletAddress").innerText = ` ${loggedInUser.address}`;
}

/**
 * Function to check the login status of the user and update the UI accordingly.
 */
function checkLoginStatus() {
  var allUsers = JSON.parse(localStorage.getItem("userData")) || [];
  var loggedInUser = allUsers.find((user) => user.isLoggedIn);

  if (loggedInUser) {
    document.getElementById("loginStatus").innerHTML = `Logged in as: <h2>${loggedInUser.username}</h2>`;
    getLoggedInUserAddress();
    getETHBalance();
    getAVAXBalance();
  } else {
    document.getElementById("loginStatus").innerHTML = "Log in to use the wallet";
    window.location.href = "login.html";
  }
}

/**
 * Function to send an ETH transaction.
 * @param {string} toAddress - The recipient address.
 * @param {number} amountInEther - The amount to send in ether.
 */
function sendETHTransaction(toAddress, amountInEther) {
  var allUsers = JSON.parse(localStorage.getItem("userData")) || [];
  var loggedInUser = allUsers.find((user) => user.isLoggedIn);
  var password = loggedInUser ? loggedInUser.password : null;

  if (!password) {
    console.log("No logged in user found");
    return;
  }

  var serializedKeystore = loggedInUser.serializedKeystore;
  var keyss = lightwallet.keystore.deserialize(serializedKeystore);
  keyss.keyFromPassword(password, function (err, pwDerivedKey) {
    if (err) throw err;
    var privateKey = keyss.exportPrivateKey(loggedInUser.address, pwDerivedKey);
    var account = web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(account);

    var transactionParams = {
      from: account.address,
      to: toAddress,
      value: web3.utils.toWei(amountInEther.toString(), "ether"),
      gas: 21000,
      gasPrice: 54340000000,
    };

    web3.eth
      .sendTransaction(transactionParams)
      .on("transactionHash", function (hash) {
        console.log("Transaction sent successfully. Transaction hash: ", hash);
        document.getElementById("transactionStatus").innerText =
          "Transaction sent successfully. Transaction hash: " + hash;

        var transactionDetails = {
          hash: hash,
          from: account.address,
          to: toAddress,
          value: amountInEther,
          type: "ETH",
        };

        if (!loggedInUser.transactions) {
          loggedInUser.transactions = [];
        }

        loggedInUser.transactions.push(transactionDetails);
        localStorage.setItem("userData", JSON.stringify(allUsers));

        var ToUser = allUsers.find((user) => user.address === toAddress);

        if (ToUser && !ToUser.transactions) {
          ToUser.transactions = [];
        }

        if (ToUser) {
          ToUser.transactions.push(transactionDetails);
        }

        localStorage.setItem("userData", JSON.stringify(allUsers));
      })
      .on("error", function (error) {
        console.error(error);
        document.getElementById("transactionStatus").innerText =
          "Transaction failed. Not enough funds to complete transaction ";
      });
  });
}

/**
 * Function to send an AVAX transaction.
 * @param {string} toAddress - The recipient address.
 * @param {number} amountInEther - The amount to send in ether.
 */
async function sendAVAXTransaction(toAddress, amountInEther) {
  var allUsers = JSON.parse(localStorage.getItem("userData")) || [];
  var loggedInUser = allUsers.find((user) => user.isLoggedIn);
  var password = loggedInUser ? loggedInUser.password : null;

  if (!password) {
    console.log("No logged in user found");
    return;
  }

  var serializedKeystore = loggedInUser.serializedKeystore;
  var keyss = lightwallet.keystore.deserialize(serializedKeystore);

  keyss.keyFromPassword(password, function (err, pwDerivedKey) {
    if (err) throw err;

    var privateKey = keyss.exportPrivateKey(loggedInUser.address, pwDerivedKey);
    var account = web3AVAX.eth.accounts.privateKeyToAccount(privateKey);
    web3AVAX.eth.accounts.wallet.add(account);

    var transactionParams = {
      from: account.address,
      to: toAddress,
      value: web3AVAX.utils.toWei(amountInEther.toString(), "ether"),
      gas: 21000,
      gasPrice: 54340000000,
    };

    web3AVAX.eth
      .sendTransaction(transactionParams)
      .on("transactionHash", function (hash) {
        console.log("Transaction sent successfully. Transaction hash: ", hash);
        document.getElementById("transactionStatus").innerText =
          "Transaction sent successfully. Transaction hash: " + hash;

        var transactionDetails = {
          hash: hash,
          from: account.address,
          to: toAddress,
          value: amountInEther,
          type: "AVAX",
        };

        if (!loggedInUser.transactions) {
          loggedInUser.transactions = [];
        }

        loggedInUser.transactions.push(transactionDetails);

        var ToUser = allUsers.find((user) => user.address === toAddress);

        if (ToUser && !ToUser.transactions) {
          ToUser.transactions = [];
        }

        if (ToUser) {
          ToUser.transactions.push(transactionDetails);
        }

        localStorage.setItem("userData", JSON.stringify(allUsers));
      })
      .on("error", function (error) {
        console.error(error);
        document.getElementById("transactionStatus").innerText =
          "Transaction failed. Not enough funds to complete transaction ";
      });
  });
}

/**
 * Function to handle sending coins.
 * @param {Event} event - The form submission event.
 */
function sendCoins(event) {
  event.preventDefault(); // prevent form from being submitted normally

  var toAddress = document.getElementById("recipient").value; // get account
  var amountInEther = document.getElementById("amount").value; // get amount
  var coinType = document.getElementById("coin").value; //get coin type

  // depending on which type of coin to choose the specific transaction function for that coin
  if (coinType === "ETH") {
    sendETHTransaction(toAddress, amountInEther);
  } else if (coinType === "AVAX") {
    sendAVAXTransaction(toAddress, amountInEther);
  }
}

/**
 * Function to fetch and display the current price of ETH.
 */
function getEthPrice() {
  fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
  )
    .then((response) => response.json())
    .then((data) => {
      const ethPrice = data.ethereum.usd;
      document.getElementById("ethPrice").innerText = `${ethPrice} `;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

/**
 * Function to fetch and display the current price of AVAX.
 */
function getAvaxPrice() {
  fetch("https://api.coingecko.com/api/v3/simple/price?ids=avalanche-2&vs_currencies=usd")
    .then((response) => response.json())
    .then((data) => {
      console.log(data); // Log the response data
      const avaxPrice = data["avalanche-2"].usd;
      console.log("AVAX Price:", avaxPrice); // Log the extracted price
      document.getElementById("avaxPrice").innerText = `${avaxPrice}`;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Call the function to ensure it runs
getAvaxPrice();

/**
 * Function to fetch and display the logged-in user's transaction history.
 */
function fetchTransactions() {
  var allUsers = JSON.parse(localStorage.getItem("userData")) || [];
  var loggedInUser = allUsers.find((user) => user.isLoggedIn);

  if (!loggedInUser) {
    console.log("No logged in user found");
    return;
  }

  let transactionList = document.getElementById("transactionList");
  let transactions = loggedInUser.transactions;

  if (transactions && transactions.length) {
    transactions.forEach((tx) => {
      let transactionRow = document.createElement("tr");
      transactionRow.innerHTML = `
        <td>
          <p><h3>Hash: </h3>${tx.hash}</p>
          <p><h3>From: </h3>${tx.from}</p>
          <p><h3>To: </h3>${tx.to}</p>
        </td>
        <td>${tx.value}</td>
        <td>${tx.type}</td>
      `;
      transactionList.appendChild(transactionRow);
    });
  } else {
    console.log("No transactions found for this user");
  }
}

/**
 * Function to restore a user account using a seed phrase.
 * @param {string} seedPhraseInput - The input seed phrase.
 * @returns {string} - The result message of the restore operation.
 */
function restoreAccount(seedPhraseInput) {
  var allUsers = JSON.parse(localStorage.getItem("userData")) || [];

  // Check if there is a user currently logged in
  var loggedInUser = allUsers.find((user) => user.isLoggedIn);
  if (loggedInUser) {
    return "A user is already logged in";
  }

  // Find the user whose seed phrase matches the input seed phrase
  var user = allUsers.find((user) => user.seedPhrase === seedPhraseInput);
  allUsers.forEach((user) => console.log(user.seedPhrase));
  console.log(seedPhraseInput);

  if (user) {
    user.password = document.getElementById("newPassword").value; // update password

    // Log in the user associated with the seed phrase
    user.isLoggedIn = true;
    localStorage.setItem("userData", JSON.stringify(allUsers));
    return "Successfully logged in, password is restored!";
  } else {
    return "No user found with the given seed phrase";
  }
}
