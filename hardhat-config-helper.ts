export const MIN_DELAY = 3600;
export const VOTING_PERIOD = 5;
export const VOTING_DELAY = 1;
export const QUORUM_PERCENTAGE = 1;
export const NEW_STORE_VALUE = 77;
export const FUNC = "store";
export const PROPOSAL_DESCRIPTION = "Proposal #1: Store 77 in the Box";
export const PROPOSAL_INDEX = 0;
export const proposalsFile = "proposals.json";

interface NetworkConfig {
    [key: number]: {
        name: string;
    };
}

export const networkConfig: NetworkConfig = {
    11155111: {
        name: "sepolia",
    },
    31337: {
        name: "hardhat",
    },
};

export const developmentChains = [31337];
