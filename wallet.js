const API_KEY = '99a405ef-dc6c-4225-99cd-76595f84d46f';
const ETH_NODE_URL = 'https://eth-goerli.nownodes.io/v1';
const ETH_EXPLORER_URL = 'https://ethbook-goerli.nownodes.io/v1';

const LTC_NODE_URL = 'https://ltc-testnet.nownodes.io/v1';
const LTC_EXPLORER_URL = 'https://ltcbook-testnet.nownodes.io/v1';

// Function to create or restore an account
function createOrRestoreAccount(mnemonic, coin) {
  let url, nodeUrl;
  
  if (coin === 'ETH') {
    url = `${ETH_NODE_URL}/account/create?mnemonic=${mnemonic}&coin=${coin}&key=${API_KEY}`;
    nodeUrl = ETH_NODE_URL;
  } else if (coin === 'LTC') {
    url = `${LTC_NODE_URL}/account/create?mnemonic=${mnemonic}&coin=${coin}&key=${API_KEY}`;
    nodeUrl = LTC_NODE_URL;
  } else {
    throw new Error('Invalid coin specified');
  }

  return fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        return {
          address: data.data.address,
          nodeUrl: nodeUrl
        };
      } else {
        throw new Error(data.error);
      }
    });
}

// Function to check balances
function checkBalances(coin, nodeUrl) {
  let url;

  if (coin === 'ETH') {
    url = `${ETH_NODE_URL}/account/balance?coin=${coin}&key=${API_KEY}`;
  } else if (coin === 'LTC') {
    url = `${LTC_NODE_URL}/account/balance?coin=${coin}&key=${API_KEY}`;
  } else {
    throw new Error('Invalid coin specified');
  }

  return fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const balances = data.data.balances;
        return balances;
      } else {
        throw new Error(data.error);
      }
    });
}

// Function to send a signed transaction
function sendSignedTransaction(coin, recipient, amount, nodeUrl) {
  let url;

  if (coin === 'ETH') {
    url = `${ETH_NODE_URL}/transaction/send?coin=${coin}&recipient=${recipient}&amount=${amount}&key=${API_KEY}`;
  } else if (coin === 'LTC') {
    url = `${LTC_NODE_URL}/transaction/send?coin=${coin}&recipient=${recipient}&amount=${amount}&key=${API_KEY}`;
  } else {
    throw new Error('Invalid coin specified');
  }

  return fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        return data.data.txid;
      } else {
        throw new Error(data.error);
      }
    });
}

// Function to get transaction history
function getTransactionHistory(coin, nodeUrl) {
  let url;

  if (coin === 'ETH') {
    url = `${ETH_EXPLORER_URL}/transactions?coin=${coin}&key=${API_KEY}`;
  } else if (coin === 'LTC') {
    url = `${LTC_EXPLORER_URL}/transactions?coin=${coin}&key=${API_KEY}`;
  } else {
    throw new Error('Invalid coin specified');
  }

  return fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const transactions = data.data;
        return transactions;
      } else {
        throw new Error(data.error);
      }
    });
}


// Function to connect to MetaMask and initialize web3
function connectToMetaMask() {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(accounts => {
          // Accounts now contains an array of available accounts
          const address = accounts[0];
          console.log('Connected to MetaMask:', address);
  
          // Initialize web3 with MetaMask provider
          web3 = new Web3(window.ethereum);
        })
        .catch(error => {
          console.error('Failed to connect to MetaMask:', error);
        });
    } else {
      console.error('MetaMask extension not detected');
    }
  }
  
  // Function to send an Ethereum transaction using MetaMask
  function sendEthTransaction(recipient, amount) {
    if (typeof web3 !== 'undefined') {
      web3.eth.sendTransaction({
        to: recipient,
        value: web3.utils.toWei(amount.toString(), 'ether'),
      })
        .then(receipt => {
          console.log('Transaction successful:', receipt);
        })
        .catch(error => {
          console.error('Failed to send transaction:', error);
        });
    } else {
      console.error('Web3 not initialized');
    }
  }
  
// Function to display transaction history
function displayTransactionHistory(coin, nodeUrl) {
  getTransactionHistory(coin, nodeUrl)
    .then(transactions => {
      const transactionListElement = document.getElementById('transactionList');
      transactionListElement.innerHTML = '';

      transactions.forEach(transaction => {
        const transactionElement = document.createElement('div');
        transactionElement.classList.add('transaction');
        transactionElement.innerHTML = `
          <h3>Transaction ID: ${transaction.txid}</h3>
          <p>Amount: ${transaction.amount}</p>
          <p>Sender: ${transaction.sender}</p>
          <p>Recipient: ${transaction.recipient}</p>
          <p>Timestamp: ${transaction.timestamp}</p>
        `;

        transactionListElement.appendChild(transactionElement);
      });
    })
    .catch(error => {
      console.error('Failed to fetch transaction history:', error);
    });
}


