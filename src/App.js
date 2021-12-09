import React, { useEffect, useState, useRef } from "react";
import './App.css';
import { ethers } from "ethers";
import abi from './utils/WavePortal.json';

const App = () => {
  const inputRef = useRef();
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]); 
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  const contractABI = abi.abi;
  const checkIfWalletIsConnected = () => {
    /*
    * First make sure we have access to window.ethereum
    */
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!!!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }
  }

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();
        

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        setAllWaves(wavesCleaned);
        wavePortalContract.on("NewWave", (from, timestamp, message) => {
          console.log("NewWave", from, timestamp, message);

          setAllWaves(prevState => [...prevState, {
            address: from,
            timestamp: new Date(timestamp * 1000),
            message: message
          }]);
        });
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }
    /**
  * Implement your connectWallet method here
  */
     const connectWallet = async () => {
      try {
        const { ethereum } = window;
  
        if (!ethereum) {
          alert("Get MetaMask!");
          return;
        }
  
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
  
        console.log("Connected", accounts[0]);
        setCurrentAccount(accounts[0]);
        getAllWaves();
      } catch (error) {
        console.log(error)
      }
    }

    const wave = async () => {
      try {
        const { ethereum } = window;
  
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
  
          let count = await wavePortalContract.getTotalWaves();
          console.log("Retrieved total wave count...", count.toNumber());
  
          /*
          * Execute the actual wave from your smart contract
          */
          const waveTxn = await wavePortalContract.wave(inputRef.current.value);
          inputRef.current.value="";
          console.log("Mining...", waveTxn.hash);
  
          await waveTxn.wait();
          console.log("Mined -- ", waveTxn.hash);
  
          count = await wavePortalContract.getTotalWaves();
          console.log("Retrieved total wave count...", count.toNumber());

        } else {
          console.log("Ethereum object doesn't exist!");
        }
      } catch (error) {
        console.log(error)
      }
    }

    /*
  * This runs our function when the page loads.
  */
    useEffect(() => {
      checkIfWalletIsConnected();
    }, [])

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        Hey there!
        </div>

        <div className="bio">
        I am <b>Avinash</b> and I am learning blockchain and it's pretty cool.<br/>
        Connect your Ethereum wallet (Rinkeby Testnet) and wave at me! 👋
        </div>

        <div className="warning"> 
        There is a wait time of 15 minutes ⌛ To avoid spamming.
        </div>

        <input className="messageBox" placeholder="Type your message here...." ref={inputRef}/>
        <button className="waveButton" onClick={wave}>
          Wave at Me and stand a chance to win some Ethereum 💰.
        </button>

        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            <b>Connect Wallet</b>
          </button>
        )}
        <div style={{ height: "600px", overflow: "scroll",}}>
        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
        <br/>
        <br/>
        <br/>
        <br/>
        <div style={{marginTop: "40px"}}></div>
        <br/>
        <br/>
        <br/>
        <br/>
        </div>
      </div>
    </div>
  );
}

export default App