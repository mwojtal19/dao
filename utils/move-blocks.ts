import { network } from "hardhat";

export const moveBlocks = async (amount: number) => {
    console.log("Moving blocks...");
    try {
        for (let i = 0; i < amount; i++) {
            await network.provider.request({
                method: "evm_mine",
            });
        }
        console.log(`Moved forward ${amount} blocks`);
    } catch (e: any) {
        console.log(e);
    }
};
