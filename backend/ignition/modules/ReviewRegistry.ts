import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ReviewRegistry", (m) => {
  const reviewRegistry = m.contract("ReviewRegistry");
  return { reviewRegistry }
})
