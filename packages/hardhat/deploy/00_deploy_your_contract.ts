import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { parseEther } from "ethers";

const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // For MONAD testnet, we'll use a mock ERC20 token for rewards
  const mockToken = await deploy("MockERC20", {
    from: deployer,
    args: ["Legal Game Token", "LGT"],
    log: true,
    autoMine: true,
  });

  await deploy("LegalGame", {
    from: deployer,
    args: [mockToken.address],
    log: true,
    autoMine: true,
  });

  // Get contract instances
  const tokenContract = await hre.ethers.getContractAt("MockERC20", mockToken.address);
  const gameContract = await hre.ethers.getContractAt("LegalGame", (await hre.deployments.get("LegalGame")).address);

  // Mint initial tokens to the game contract for rewards
  const INITIAL_SUPPLY = parseEther("1000000"); // 1M tokens
  await tokenContract.mint(gameContract.getAddress(), INITIAL_SUPPLY);

  console.log("✅ Deployed LegalGame to:", await gameContract.getAddress());
  console.log("✅ Deployed MockERC20 to:", mockToken.address);
  console.log("✅ Minted initial token supply to game contract");
};

export default deployYourContract;
deployYourContract.tags = ["LegalGame"];
