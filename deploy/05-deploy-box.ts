import { deployments, ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains } from "../hardhat-config-helper";
import { verify } from "../utils/verify";

const deployBox: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    const accounts = await ethers.getSigners();
    const deployer = accounts[0];
    const chainId = hre.network.config.chainId!;
    const args: any[] = [];
    const box = await hre.deployments.deploy("Box", {
        from: deployer.address,
        args: args,
        log: true,
        waitConfirmations: 1,
    });
    const timeLockContractDeployment = await deployments.get("TimeLock");
    const timeLock = await ethers.getContractAt(
        "TimeLock",
        timeLockContractDeployment.address,
        deployer
    );
    const boxContract = await ethers.getContractAt("Box", box.address);
    const transferOwnerTx = await boxContract.transferOwnership(
        await timeLock.getAddress()
    );
    await transferOwnerTx.wait(1);

    if (!developmentChains.includes(chainId) && process.env.ETHERSCAN_API_KEY) {
        await verify(box.address, args);
    }
    hre.deployments.log("---------------------------------");
};

export default deployBox;
deployBox.tags = ["all", "box"];
