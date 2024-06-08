import { ZeroAddress } from "ethers";
import { deployments, ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const setupContracts: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    const accounts = await ethers.getSigners();
    const deployer = accounts[0];
    const chainId = hre.network.config.chainId!;
    const governorContractDeployment = await deployments.get(
        "GovernorContract"
    );
    const timeLockContractDeployment = await deployments.get("TimeLock");
    const timeLock = await ethers.getContractAt(
        "TimeLock",
        timeLockContractDeployment.address,
        deployer
    );
    const governorContract = await ethers.getContractAt(
        "GovernorContract",
        governorContractDeployment.address,
        deployer
    );
    const proposerRole = await timeLock.PROPOSER_ROLE();
    const executorRole = await timeLock.EXECUTOR_ROLE();
    const adminRole = await timeLock.DEFAULT_ADMIN_ROLE();
    const proposerTx = await timeLock.grantRole(
        proposerRole,
        await governorContract.getAddress()
    );
    await proposerTx.wait(1);
    const executorTx = await timeLock.grantRole(executorRole, ZeroAddress);
    await executorTx.wait(1);
    const revokeTx = await timeLock.revokeRole(adminRole, deployer.address);
    await revokeTx.wait(1);
};

export default setupContracts;
setupContracts.tags = ["all", "setupContracts"];
