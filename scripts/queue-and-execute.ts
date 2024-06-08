import { keccak256, toUtf8Bytes } from "ethers";
import { deployments, ethers, network } from "hardhat";
import {
    developmentChains,
    FUNC,
    MIN_DELAY,
    NEW_STORE_VALUE,
    PROPOSAL_DESCRIPTION,
} from "../hardhat-config-helper";
import { moveBlocks } from "../utils/move-blocks";
import { moveTime } from "../utils/move-time";

const chainId = network.config.chainId!;
async function main() {
    const governorDeployment = await deployments.get("GovernorContract");
    const governor = await ethers.getContractAt(
        "GovernorContract",
        governorDeployment.address
    );
    const box = await ethers.getContractFactory("Box");
    const boxDeployment = await deployments.get("Box");
    const boxContract = await ethers.getContractAt(
        "Box",
        boxDeployment.address
    );
    const args = [NEW_STORE_VALUE];
    const encodedFunctionCall = box.interface.encodeFunctionData(FUNC, args);
    const descriptionHash = keccak256(toUtf8Bytes(PROPOSAL_DESCRIPTION));
    console.log("Queueing...");
    const queueTx = await governor.queue(
        [boxDeployment.address],
        [0],
        [encodedFunctionCall],
        descriptionHash
    );
    await queueTx.wait(1);
    if (developmentChains.includes(chainId)) {
        await moveTime(MIN_DELAY + 1);
        await moveBlocks(1);
    }
    console.log("Executing...");
    const executeTx = await governor.execute(
        [boxDeployment.address],
        [0],
        [encodedFunctionCall],
        descriptionHash
    );
    await executeTx.wait(1);
    const boxNewValue = await boxContract.retrieve();
    console.log(`New Box value: ${boxNewValue.toString()}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
