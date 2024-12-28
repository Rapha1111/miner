const connectWalletButton = document.getElementById("connect-wallet");
const gameSection = document.getElementById("game-section");
const mineurSection = document.getElementById("minergestion");
const cryptoBalance = document.getElementById("crypto-balance");
const goldtomine = document.getElementById("current-gold");
const maxgold = document.getElementById("max-gold");

let userAddress = "";
let contract; // Will hold the smart contract instance

const CONTRACT_ADDRESS = "0x3bB1BFCC876Cad8f8F185074b9A3fDAA31470B60";
const SEPOLIA_CHAIN_ID = "0xAA36A7"; // Hexadecimal for 11155111

// Check if MetaMask is available
if (typeof window.ethereum) {
    console.log("MetaMask is available");
} else {
    alert("MetaMask is not installed. Please install it to use this DApp.");

}

// Function to fetch the contract ABI
async function fetchContractABI() {
    try {
        const response = await fetch("abi.json");
        if (!response.ok) {
            throw new Error("Failed to fetch ABI file");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching ABI:", error);
        return null;
    }
}

// Function to switch to Sepolia network
async function switchToSepolia() {
    try {
        await ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: SEPOLIA_CHAIN_ID }],
        });
        console.log("Switched to Sepolia network");
    } catch (switchError) {
        // If the network is not added to MetaMask, attempt to add it
        if (switchError.code === 4902) {
            try {
                await ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [
                        {
                            chainId: SEPOLIA_CHAIN_ID,
                            chainName: "Sepolia Test Network",
                            nativeCurrency: {
                                name: "Sepolia Ether",
                                symbol: "ETH",
                                decimals: 18,
                            },
                            rpcUrls: ["https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID"],
                            blockExplorerUrls: ["https://sepolia.etherscan.io"],
                        },
                    ],
                });
                console.log("Sepolia network added and switched");
            } catch (addError) {
                console.error("Error adding Sepolia network:", addError);
            }
        } else {
            console.error("Error switching network:", switchError);
        }
    }
}

// Function to connect MetaMask
async function connectMetaMask() {
    try {
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        userAddress = accounts[0];
        console.log("Connected account:", userAddress);

        // Check the network
        const currentChainId = await ethereum.request({ method: "eth_chainId" });
        if (currentChainId !== SEPOLIA_CHAIN_ID) {
            await switchToSepolia();
        }

        // Display the game section
        document.getElementById("connect-section").style.display = "none";
        gameSection.style.display = "block";

        // Fetch ABI and initialize the contract
        const CONTRACT_ABI = await fetchContractABI();
        if (!CONTRACT_ABI) return;

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        // Fetch the user's token balance
        await updateBalance();
        await hasgootenfreeeminer();
    } catch (error) {
        console.error("Error connecting to MetaMask:", error);
    }
}

// Function to update the user's token balance
async function updateBalance() {
    try {
        const balance = await contract.balanceOf(userAddress);
        const gold = await contract.dispoGold(userAddress);
        goldtomine.textContent = gold
        const mms = await contract.maxMineStorage();
        maxgold.textContent = mms
        cryptoBalance.textContent = balance
    } catch (error) {
        console.error("Error fetching balance:", error);
    }
}

async function extract(){
    try {
        
        contract.extractMine().then(()=>{updateBalance()});
    } catch (error) {
        console.error("Error fetching balance:", error);
    }
}
async function upgradeMine(){
    try {
        if (parseInt(cryptoBalance.innerHTML)>=1000){
            contract.upgradeMineStorage().then(()=>{updateBalance()});
        } else {
            alert("Il vous faut 1000 gold pour cela")
        }
        
    } catch (error) {
        console.error("Error fetching balance:", error);
    }
}

async function hasgootenfreeeminer(){
    try {
        
        fm = await contract.hasGotFreeMiner()
        if (!fm){
            alert("On récupère le mineur gratuit !")
            await contract.getFreeMiner()
        }
    } catch (error) {
        console.error("Error fetching balance:", error);
    }
}
async function mintminer(){
    if (parseInt(cryptoBalance.innerHTML)>=1500){
        contract.mintMiner().then(()=>{updateBalance()});
    } else {
        alert("Il vous faut 1500 gold pour cela")
    }
}

function back(){
    gameSection.style.display = "block";
    mineurSection.style.display="none";
    updateBalance()
}

async function minergestion(){
    gameSection.style.display = "none";
    mineurSection.style.display="block";
    document.getElementById("miners-data").innerHTML=""
    contract.getMiners(userAddress).then(a=>{a.forEach(mineradd)})

}

async function mineradd(i){
    b=parseInt(i)
    d=await contract.getMinerData(b)
    lvl=parseInt(d[0])
    id=parseInt(d[4])
    winrate=parseInt(d[0]) * parseInt(d[1]) + parseInt(d[2])
    document.getElementById("miners-data").innerHTML+=`<div id="mine-container">
    <p>Id : `+id+`, Level : `+lvl+`, Winrate : `+winrate+` mGOLD/min</p>
    <button id="mint_miner" onclick="levelup(`+id+`, `+lvl+`)">Level UP</button>
    <button id="mint_miner" onclick="transferminer(`+id+`)">Transfer</button>
    </div>`
}

function levelup(id, lvl){
    if (parseInt(cryptoBalance.innerHTML)>=(lvl*200)){
        contract.levelupMiner(id)
    } else {
        alert("Il vous faut "+lvl*200+" gold pour cela")
    }   
}

function transferminer(id){
    contract.safeTransferFrom(userAddress, prompt("receiver address"), id)
}


// Event listener for the connect wallet button
connectWalletButton.addEventListener("click", connectMetaMask);



//a ajouter : le mineur gratuit