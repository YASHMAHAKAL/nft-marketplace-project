export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as string;

if (!CONTRACT_ADDRESS) {
  throw new Error("⚠️ Contract address is not defined. Did you set VITE_CONTRACT_ADDRESS in .env?");
}
