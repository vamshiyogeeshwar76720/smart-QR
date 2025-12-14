import { contractABI } from "./abi.js";

const params = new URLSearchParams(window.location.search);
const contractAddress = params.get("contract");
const planId = params.get("planId");

document.getElementById("connectWallet").onclick = async () => {
  if (!window.ethereum) {
    alert("Install MetaMask / Binance / Trust Wallet");
    return;
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const sender = await signer.getAddress();

  const contract = new ethers.Contract(contractAddress, contractABI, signer);

  const plan = await contract.plans(planId);

  const token = new ethers.Contract(
    plan.tokenAddress,
    ["function approve(address,uint256) external returns (bool)"],
    signer
  );

  // 1️⃣ Approve full EMI amount (or totalAmount if you want)
  await token.approve(contractAddress, plan.emiAmount);

  // 2️⃣ Activate plan (pays first EMI internally)
  await contract.activatePlan(planId);

  alert("Payment successful. EMI auto-pay started.");
};
