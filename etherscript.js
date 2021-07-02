
let txHash            = ""
let receiver          = ""
let chainId           = ""
let soldeAccount      = ""
let tipper_addresses
let nameProvider
// connect to metamask
window.onload     = async () => {
  if (window.ethereum) {
    await window.ethereum.send('eth_requestAccounts');
/*    await window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts) => console.log(accounts))
        .catch((error) => console.error(error.code));
*/        

    window.web3 = new Web3(window.ethereum);
    tipper_addresses =  await web3.eth.getAccounts()
    nameProvider = getProviderName(await web3.eth.getChainId());
    getSolde(0)
    let urlEtherUser = nameProvider.explorer + "/address/"+ tipper_addresses
    let urlImgEther = "<a href='" + urlEtherUser + "' target='_blank'><img src='./img/etherscan.png' alt='Etherscan' class='imgetherscan' width='200' height='80'></a>"

    renderMessage(urlImgEther, "#etherscanview","p2")
    renderMessage(nameProvider.name, "#currentNetWork","p0")

  } else { alert("Install Metamask")}
};


const tip = async () => {
    renderMessage('Wating user choice ... (pleeeaaase confirm !)', '#messageTx',"p1")
      const my_address = document.querySelector('#toAddress').value;
      try {
        const address = web3.utils.toChecksumAddress(my_address)
      } catch(e) { 
        renderMessage("Should I buy U a right hand 4 XMas ? check address pls", '#messageTx', "p1red")
console.error('invalid ethereum address', e.message) 
        return
      }

    
    const ethTip = document.querySelector('#tips').value
    tipper_addresses = await web3.eth.getAccounts();

    await web3.eth.sendTransaction({
        to: my_address,
        from: tipper_addresses[0],
        value: web3.utils.toWei(ethTip, 'ether'), 
        gas: 50000,
    })
    .once('transactionHash', (hash) => {
        txHash = hash 
        renderMessage('Processing ... ',"#messageTx", "p1")
    })
    .once('confirmation', (receipt) => {
        getSolde(1)
      })
    .once('receipt', (receipt) => {
      renderMessage("Thanks for so much generosity!! Tx: <br />" + txHash +"", "#messageTx", "p1green");
    })
    .on('error', (err) => {
        renderMessage(err.message,'#messageTx',"p1red")
console.log(err)
      })
}

 
// Recuperation du solde du compte actif
const getSolde= async (when) => {
  renderMessage("Updating ca$h balance ...", "#messageTx", "p1red");
  soldeAccount = await web3.eth.getBalance(tipper_addresses[0])
  renderMessage("Ca$h :" + web3.utils.fromWei(soldeAccount) + " ETH", "#solde", "p1green")
  if (when==0) {
    renderMessage("", "#messageTx");
  }
//console.log("Wei Solde = " +soldeAccount)        
}


//CHANGEMENT DE PROVIDER : RELOAD  
ethereum.on('chainChanged', handleChainChanged);
function handleChainChanged(_chainId) {
  // recommendation metamask
  window.location.reload();
}

// Display des msg
const renderMessage = (message, htmlSelector, pcss) => {
  const messageEl = document.querySelector(htmlSelector)
  messageEl.innerHTML = "<p class='" + pcss +"'>" + message +"</p>"
}


// recuperation du nom du reseau
const getProviderName= (chainId) => {
  switch(chainId) {
      case 1: 
      return {
        "name":"Ethereum Main Network",
        "explorer":"https://etherscan.io",
        "api":"api"
      }
            break;
      case 3: 
      return {
        "name":"On Ropsten",
        "explorer":"https://ropsten.etherscan.io",
        "api":"api-ropsten"
      }
            break;
      case 4: 
      return {
        "name":"Rinkeby",
        "explorer":"https://rinkeby.etherscan.io",
        "api":"api-rinkeby"
      }
            break;
      case 5: 
      return {
        "name":"Goerli",
        "explorer":"https://goerli.etherscan.io",
        "api":"api-goerli"
      }
            break;
      case 42: 
      return {
        "name":"Kovan",
        "explorer":"https://kovan.etherscan.io",
        "api":"api-kovan"
      }
            break;
      case 97: 
      return {
        "name":"Binance Smart Chain Testnet",
        "explorer":"https://testnet.bscscan.com",
        "api":"none"
      }
            break;      
      case 80001: 
      return {
        "name":"Mumbai",
        "explorer":"https://explorer-mumbai.maticvigil.com/",
        "api":"none"
      }
            break;      

      default:             
      return {
        "name":"Not yet registered ...",
        "explorer":"https://chainlist.org",
        "api":"none"
      }

      
    } 
  }

document.getElementById("tip-button").addEventListener("click", tip);

