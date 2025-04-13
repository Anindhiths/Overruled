import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployLegalGame: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("LegalGame", {
    from: deployer,
    args: [],
    log: true,
  });
};

export default deployLegalGame;
deployLegalGame.tags = ["LegalGame"]; 