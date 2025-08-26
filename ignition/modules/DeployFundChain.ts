import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const FundChainModule = buildModule("FundChainModule", (m) => {
  const fundChain = m.contract("FundChain");

  return { fundChain };
});

export default FundChainModule;