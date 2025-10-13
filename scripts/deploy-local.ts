import { network } from "hardhat"

const { ethers } = await network.connect()


async function main() {
    console.log("Deploying contracts to local network...")

    const Voting = await ethers.getContractFactory("Voting")
    const voting = await Voting.deploy()

    await voting.waitForDeployment()
    const address = await voting.getAddress()
    
    console.log("Voting contract deployed to:", address)
    console.log("Owner:", await voting.owner())
    console.log("Initial votingActive:", await voting.votingActive())
    console.log("Initial candidateCount:", await voting.candidateCount())

    console.log("\nUpdate client/.env with:")
    console.log(`VOTING_CONTRACT_ADDRESS=${address}`)
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})