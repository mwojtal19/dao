import { deployments, ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
    developmentChains,
    QUORUM_PERCENTAGE,
    VOTING_DELAY,
    VOTING_PERIOD,
} from "../hardhat-config-helper";
import { verify } from "../utils/verify";

const deployGovernorContract: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    const accounts = await ethers.getSigners();
    const deployer = accounts[0];
    const chainId = hre.network.config.chainId!;
    const governanceToken = await deployments.get("GovernanceToken");
    const timeLock = await deployments.get("TimeLock");
    const args: any[] = [
        governanceToken.address,
        timeLock.address,
        VOTING_DELAY,
        VOTING_PERIOD,
        QUORUM_PERCENTAGE,
    ];
    const governorContract = await hre.deployments.deploy("GovernorContract", {
        from: deployer.address,
        args: args,
        log: true,
        waitConfirmations: 1,
    });
    if (!developmentChains.includes(chainId) && process.env.ETHERSCAN_API_KEY) {
        await verify(governorContract.address, args);
    }
    hre.deployments.log("---------------------------------");
};

export default deployGovernorContract;
deployGovernorContract.tags = ["all", "governorContract"];
