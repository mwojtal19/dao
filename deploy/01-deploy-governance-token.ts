import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains } from "../hardhat-config-helper";
import { verify } from "../utils/verify";

const deployGovernanceToken: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    const accounts = await ethers.getSigners();
    const deployer = accounts[0];
    const chainId = hre.network.config.chainId!;
    const args: any[] = [];
    const governanceToken = await hre.deployments.deploy("GovernanceToken", {
        from: deployer.address,
        args: args,
        log: true,
        waitConfirmations: 1,
    });
    await delegate(governanceToken.address, deployer.address);
    if (!developmentChains.includes(chainId) && process.env.ETHERSCAN_API_KEY) {
        await verify(governanceToken.address, args);
    }
    hre.deployments.log("---------------------------------");
};

const delegate = async (
    governanceTokenAddress: string,
    delegatedAccount: string
) => {
    const governanceToken = await ethers.getContractAt(
        "GovernanceToken",
        governanceTokenAddress
    );
    const tx = await governanceToken.delegate(delegatedAccount);
    await tx.wait(1);
    console.log(
        `Checkpoints ${await governanceToken.numCheckpoints(delegatedAccount)}`
    );
};
export default deployGovernanceToken;
deployGovernanceToken.tags = ["all", "governanceToken"];
