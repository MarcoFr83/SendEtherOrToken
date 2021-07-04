// Token test tx
// 0x5161C0F8D8F8721eE30E7d5aBb273c6DA1A554ff 
// 0x08081E5003291c10EcA280F8a1A16610A85860C4
// 0x3841cE901b6d8bD32416127D81F355B57E4Bb4F2 DAVID
// CNX metamask ok.
  let tokenSolde ;
  let tokenState = false;
  let tokenName;
  let tokenSymbol;
  let tokenAddress;
  let tokenToAddress;
  let tokenAmount;
  let tokenNetwork;
  let contractABI = "";
  let MyContract;
  let urlApi;

  window.web3 = new Web3(window.ethereum);

    /***************************************************************
    *       GET ABI FROM CONTRACT
    * should verify contract address first
    * should verify network to put it in etherscan api
    * or change api url if not on etherscan
    * and so on...
    * 
    ***************************************************************/
  // upload ABI directly from token contract address
  // Voir pour virer le JQuery (=>fetch en async...)
     const getABI = async () => {
        tokenAddress = document.querySelector('#tokenAddress').value;
        tokenNetwork = getProviderName(await web3.eth.getChainId()).api;
        urlApi = "https://" + tokenNetwork + ".etherscan.io/api?module=contract&action=getabi&address=" + tokenAddress + "&apikey=T5YVE6PQ1YH5PP3YGGPVNK8IE5AIMIGS24";
console.log(tokenNetwork);
        //await $.getJSON('https://api-kovan.etherscan.io/api?module=contract&action=getabi&address=0x5161C0F8D8F8721eE30E7d5aBb273c6DA1A554ff&apikey=T5YVE6PQ1YH5PP3YGGPVNK8IE5AIMIGS24', 
        await $.getJSON(urlApi, 
            function (data) {
            contractABI = JSON.parse(data.result);
//console.log("ABI :" + contractABI);            
        })
        if (contractABI == ''){   // Json KO
console.log("Error on ABI..." );
console.log("ABI : see XHR Request response ...");
        }   else {
            getTokenName();
console.log("Contract ABI => ");
console.log(contractABI);        
            }
    }// ABI 
     

    /***************************************************************
    *       TOKEN BALANCE 
    ***************************************************************/
    const getTokenBalance= async () => {
        tokenAddress = document.querySelector('#tokenAddress').value;
//        renderMessage(" Accessing token ... ", "#messageToken", "p1");
        try {
            MyContract = new web3.eth.Contract(contractABI,tokenAddress);
            tokenSolde = await MyContract.methods.balanceOf(tipper_addresses[0]).call()*(10**-18);
            tokenState = true;
            renderMessage("Solde " + tokenName + "(" + tokenSymbol +") :" + tokenSolde, "#eduToken", "p1green");
//console.log(tokenSolde);
        }   catch (e) {
                renderMessage(" Problems getting balance Token, pls check ! ", "#messageToken", "p1red");
console.log(e);
            }
    }// tokenBalance


    /***************************************************************
    *       GET TOKEN NAME & SYMBOL
    *       LAUNCH getBalance() 
    ***************************************************************/
    const getTokenName= async () => {
        tokenAddress = document.querySelector('#tokenAddress').value;
        getTokenBalance();
        //let MyContract = new web3.eth.Contract(contractABI,"0x5161C0F8D8F8721eE30E7d5aBb273c6DA1A554ff");
        let MyContract = new web3.eth.Contract(contractABI,tokenAddress);
console.log(MyContract);
        await MyContract.methods.name().call()
            .then(function(res) {
                tokenName = res;
            })
        tokenSymbol = await MyContract.methods.symbol().call();
        renderMessage("Solde " + tokenName + "(" + tokenSymbol +") :" + tokenSolde, "#eduToken", "p1green");
        renderMessage("", "#messageToken", "p1");

    }   
  
    /***************************************************************
    *       VERIFY RECIPIENT ADDRESS 
    ***************************************************************/
    const verifyAddress= async () => {
        tokenToAddress = document.querySelector('#tokenToAddress').value;
console.log("verifying token address =>" + tokenToAddress);
        try {
            const addressTest = await web3.utils.toChecksumAddress(tokenToAddress);
            if (addressTest === "0xEF2C2a05638f4872f5732DFe5240b2Aa8315AcA1") {
                renderMessage("Thank U so muuuuuuuch !", '#messageToken', "p1green")
            } else {
                renderMessage("Ok...ok, not my own address... but ok !", '#messageToken', "p1green")
            }
        } catch(e) { 
            renderMessage("Should I buy U a right hand 4 XMas ? check address pls", '#messageToken', "p1red")
console.error('invalid ethereum address', e.message) 
            return;
        } 
    } // verifyAddress

    /*************************************************************
    *       SEND TOKEN
    **************************************************************/
    const sendToken= async () => {
        await verifyAddress();
        await getABI();   // relance le chargement de l'ABI, balance et name/symbol
        tokenAmount = document.querySelector('#tokenAmount').value;
        if (tokenAmount <= tokenSolde && tokenState) {
            renderMessage("Sending token ...", '#messageToken', "p1green")
            try {
                MyContract = new web3.eth.Contract(contractABI,tokenAddress);

console.log("Transfert : to =>" + tokenToAddress + " amount =>" + tokenAmount);
                tokenAmount = web3.utils.toWei(tokenAmount, 'ether');
                const txHash = await MyContract.methods.transfer(tokenToAddress,tokenAmount).send({from: tipper_addresses[0]})
                .once('transactionHash', (hash) => {
                    renderMessage('Processing ... <br />TX:' + hash ,"#messageToken", "p1green")
                })
                .then((receipt) => {
                    // receipt can also be a new contract instance, when coming from a "contract.deploy({...}).send()"
                    const gasUSed   = receipt.gasUsed;
                    const statusTx  = receipt.status;
                    const txHash    = receipt.transactionHash;
                    let msgRender   = "Status =>"+ statusTx;
                    msgRender      += "  - Gas used =>"+ gasUSed;
                    msgRender      += "  <br />Tx Hash =>"+ txHash;
                    renderMessage("Transaction ok. : <br />" + msgRender + "", '#messageToken', "p1green")
                    getTokenBalance();
                });
                        
            }   catch(error) { 
console.error('invalid transfer transaction ', error.message) 
                    renderMessage("Transaction error : " + error.message.substring(0,50) + "...", '#messageToken', "p1red")
                    return;
                } 
                
        } else {
            renderMessage("U feel right? Seems U haven't enough token / token error !", '#messageToken', "p1red")      
        }
    } // sendToken



    /***************************************************************
    *           DOM EVENTS ON INPUT/BUTTON
    *   (test on already input contract address -> eg refresh screen)
    ***************************************************************/
     if (document.querySelector('#tokenAmount').value !="") {
         getABI();
     }
    document.getElementById("tokenAddress").addEventListener("blur",getABI);
    document.getElementById("tokenToAddress").addEventListener("blur", verifyAddress);
    document.getElementById("token-button").addEventListener("click", sendToken);


    /*
                            BAO

    CNX contract
    MyContract.options.address = '0x5161C0F8D8F8721eE30E7d5aBb273c6DA1A554ff';


    */