import { network } from "hardhat";

export const moveTime = async (amount: number) => {
    console.log("Moving time...");
    try {
        await network.provider.send("evm_increaseTime", [amount]);
        console.log(`Moved forward ${amount} seconds`);
    } catch (e: any) {
        console.log(e);
    }
};
