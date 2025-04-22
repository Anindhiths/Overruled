import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployLegalGame: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Deploy a mock token first
  const mockToken = await deploy("MockERC20", {
    from: deployer,
    args: ["Legal Game Token", "LGT"],
    log: true,
  });

  // Deploy the LegalGame contract with the mock token and deployer as owner
  await deploy("LegalGame", {
    from: deployer,
    args: [mockToken.address, deployer],
    log: true,
  });
};

export default deployLegalGame;
deployLegalGame.tags = ["LegalGame"]; 