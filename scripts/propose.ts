import { EventLog } from "ethers";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { deployments, ethers, network } from "hardhat";
import {
    developmentChains,
    FUNC,
    NEW_STORE_VALUE,
    PROPOSAL_DESCRIPTION,
    proposalsFile,
    VOTING_DELAY,
} from "../hardhat-config-helper";
import { moveBlocks } from "../utils/move-blocks";

async function main(args: any[], functionToCall: string, description: string) {
    const chainId = network.config.chainId!;
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
    const encodedFunctionCall = box.interface.encodeFunctionData(
        functionToCall,
        args
    );
    console.log(
        `Proposing ${functionToCall} on ${boxDeployment.address} with ${args}`
    );
    console.log(`Proposal descritpion ${description}`);
    const proposeTx = await governor.propose(
        [boxDeployment.address],
        [0],
        [encodedFunctionCall],
        description
    );
    if (developmentChains.includes(chainId)) {
        await moveBlocks(VOTING_DELAY + 1);
    }
    const proposeReceipt = await proposeTx.wait(1);
    const proposalId = await (proposeReceipt!.logs[0] as EventLog).args
        .proposalId;
    console.log(`Proposed with proposal ID:\n  ${proposalId}`);
    const proposalState = await governor.state(proposalId);
    const proposalSnapShot = await governor.proposalSnapshot(proposalId);
    const proposalDeadline = await governor.proposalDeadline(proposalId);
    // save the proposalId
    storeProposalId(proposalId);
    // the Proposal State is an enum data type, defined in the IGovernor contract.
    // 0:Pending, 1:Active, 2:Canceled, 3:Defeated, 4:Succeeded, 5:Queued, 6:Expired, 7:Executed
    console.log(`Current Proposal State: ${proposalState}`);
    // What block # the proposal was snapshot
    console.log(`Current Proposal Snapshot: ${proposalSnapShot}`);
    // The block number the proposal voting expires
    console.log(`Current Proposal Deadline: ${proposalDeadline}`);
}

function storeProposalId(proposalId: any) {
    const chainId = network.config.chainId!.toString();
    let proposals: any;

    if (existsSync(proposalsFile)) {
        proposals = JSON.parse(readFileSync(proposalsFile, "utf8"));
    } else {
        proposals = {};
        proposals[chainId] = [];
    }
    proposals[chainId].push(proposalId.toString());
    writeFileSync(proposalsFile, JSON.stringify(proposals), "utf8");
}

main([NEW_STORE_VALUE], FUNC, PROPOSAL_DESCRIPTION)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
