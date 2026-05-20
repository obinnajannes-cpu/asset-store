import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("OEVModule", (m) => {
  const oev = m.contract("OEV");

  return { oev };
});
