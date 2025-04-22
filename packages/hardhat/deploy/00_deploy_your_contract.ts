import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network monadTestnet`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  
  // Get the network name
  const networkName = hre.network.name;
  
  // Deploy the ERC20 token first
  const mockToken = await deploy("MockERC20", {
    from: deployer,
    args: ["Legal Game Token", "LGT"],
    log: true,
    autoMine: true,
  });

  console.log(`Deployed MockERC20 to: ${mockToken.address}`);

  // Then deploy the main contract with the token address
  const legalGame = await deploy("LegalGame", {
    from: deployer,
    // Constructor arguments
    args: [mockToken.address, deployer],
    log: true,
    autoMine: true,
  });

  console.log(`Deployed LegalGame to: ${legalGame.address}`);

  // Get contract instances
  const mockTokenContract = await ethers.getContractAt("MockERC20", mockToken.address);
  const legalGameContract = await ethers.getContractAt("LegalGame", legalGame.address);

  // Mint tokens to the game contract (1 million tokens with 18 decimals)
  if (networkName === "hardhat" || networkName === "localhost") {
    await mockTokenContract.mint(legalGame.address, ethers.parseEther("1000000"));
    console.log(`Minted initial token supply to game contract`);
  } else if (networkName === "monadTestnet") {
    try {
      // Special handling for Monad Testnet
      console.log("Deploying to Monad Testnet...");
      await mockTokenContract.mint(legalGame.address, ethers.parseEther("1000000"));
      console.log(`Minted initial token supply to game contract on Monad Testnet`);
      
      // Log transaction URLs for block explorer
      console.log(`View contracts on Monad Explorer:`);
      console.log(`MockERC20: https://testnet.monadexplorer.com/address/${mockToken.address}`);
      console.log(`LegalGame: https://testnet.monadexplorer.com/address/${legalGame.address}`);
    } catch (error) {
      console.error("Error during Monad Testnet deployment:", error);
    }
  }
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["YourContract", "MockERC20", "LegalGame"];
