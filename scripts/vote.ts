import { EventLog } from "ethers";
import { readFileSync } from "fs";
import { deployments, ethers, network } from "hardhat";
import {
    developmentChains,
    PROPOSAL_INDEX,
    proposalsFile,
    VOTING_PERIOD,
} from "../hardhat-config-helper";
import { moveBlocks } from "../utils/move-blocks";
const chainId = network.config.chainId!;
async function main(proposalIndex: number) {
    const proposals = JSON.parse(readFileSync(proposalsFile, "utf8"));
    const proposalId = proposals[chainId][proposalIndex];
    // 0=Againts, 1=For, 2=Abstain
    const voteWay = 1;
    const reason = "Any reason";
    await vote(proposalId, voteWay, reason);
}

export async function vote(
    proposalId: string,
    voteWay: number,
    reason: string
) {
    console.log("Voting...");
    const governorDeployment = await deployments.get("GovernorContract");
    const governor = await ethers.getContractAt(
        "GovernorContract",
        governorDeployment.address
    );
    const voteTx = await governor.castVoteWithReason(
        proposalId,
        voteWay,
        reason
    );
    const voteTxReceipt = await voteTx.wait(1);
    console.log(
        "Reason " + (await (voteTxReceipt!.logs[0] as EventLog).args.reason)
    );
    const proposalState = await governor.state(proposalId);
    console.log(`Current Proposal State: ${proposalState}`);
    if (developmentChains.includes(chainId)) {
        await moveBlocks(VOTING_PERIOD + 1);
    }
}

main(PROPOSAL_INDEX)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
