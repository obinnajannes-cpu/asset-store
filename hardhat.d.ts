import "hardhat/types/config";

declare module "hardhat/types/config" {
  export interface HardhatUserConfig {
    etherscan?: {
      apiKey?: string;
    };
  }
}
