import { expect } from "chai"
import { network } from "hardhat"
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/types"
import type { Voting } from "../types/ethers-contracts/Voting.ts"

const { ethers } = await network.connect()

describe("Voting", function () {
  let voting: Voting
  let owner: HardhatEthersSigner
  let voter1: HardhatEthersSigner
  let voter2: HardhatEthersSigner

  beforeEach(async function () {
    [owner, voter1, voter2] = await ethers.getSigners()
    const VotingFactory = await ethers.getContractFactory("Voting")
    voting = (await VotingFactory.deploy()) as Voting
    await voting.waitForDeployment()
  })

  it("should have correct initial state", async function () {
    expect(await voting.votingActive()).to.equal(false)
    expect(await voting.candidateCount()).to.equal(0n)
    expect(await voting.owner()).to.equal(await owner.getAddress())
  })

  it("should allow owner to add candidate", async function () {
    await voting.connect(owner).addCandidate(1n)
    const [id, totalRating, voteCount] = await voting.candidates(1n)
    expect(id).to.equal(1n)
    expect(totalRating).to.equal(0n)
    expect(voteCount).to.equal(0n)
    expect(await voting.candidateCount()).to.equal(1n)
  })

  it("should revert if non-owner adds candidate", async function () {
    await expect(
      voting.connect(voter1).addCandidate(1n)
    ).to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount").withArgs(voter1.address)
  })

  it("should allow owner to start and end voting", async function () {
    await voting.connect(owner).startVoting()
    expect(await voting.votingActive()).to.equal(true)

    await voting.connect(owner).endVoting()
    expect(await voting.votingActive()).to.equal(false)
  })

  it("should allow voting and calculate average rating", async function () {
    await voting.connect(owner).addCandidate(1n)
    await voting.connect(owner).startVoting()

    await voting.connect(voter1).submitVote(1n, 75n)
    const [id, totalRating, voteCount] = await voting.candidates(1n)
    expect(totalRating).to.equal(75n)
    expect(voteCount).to.equal(1n)
    expect(await voting.hasVoted(await voter1.getAddress(), 1n)).to.equal(true)
    expect(await voting.getAverageRating(1n)).to.equal(75n)

    await voting.connect(voter2).submitVote(1n, 25n)
    expect(await voting.getAverageRating(1n)).to.equal(50n)
  })

  it("should revert if voting when not active", async function () {
    await voting.connect(owner).addCandidate(1n)
    await expect(
      voting.connect(voter1).submitVote(1n, 75n)
    ).to.be.revertedWith("Voting not active")
  })

  it("should revert if rating exceeds 100", async function () {
    await voting.connect(owner).addCandidate(1n)
    await voting.connect(owner).startVoting()
    await expect(
      voting.connect(voter1).submitVote(1n, 101n)
    ).to.be.revertedWith("Rating must be 0-100")
  })

  it("should revert if voter votes twice", async function () {
    await voting.connect(owner).addCandidate(1n)
    await voting.connect(owner).startVoting()
    await voting.connect(voter1).submitVote(1n, 75n)
    await expect(
      voting.connect(voter1).submitVote(1n, 50n)
    ).to.be.revertedWith("Already voted")
  })

  it("should revert if voting for invalid candidate", async function () {
    await voting.connect(owner).startVoting()
    await expect(
      voting.connect(voter1).submitVote(999n, 75n)
    ).to.be.revertedWith("Invalid candidate")
  })

  it("should revert if getting average rating with no votes", async function () {
    await voting.connect(owner).addCandidate(1n)
    await expect(
      voting.getAverageRating(1n)
    ).to.be.revertedWith("No votes")
  })

  // State-based test (inspired by Counter's event emission)
  it("should correctly update candidate state when submitting a vote", async function () {
    await voting.connect(owner).addCandidate(1n)
    await voting.connect(owner).startVoting()

    await voting.connect(voter1).submitVote(1n, 75n)
    const [id, totalRating, voteCount] = await voting.candidates(1n)
    expect(id).to.equal(1n)
    expect(totalRating).to.equal(75n)
    expect(voteCount).to.equal(1n)
  })

  // State aggregation test (inspired by Counter's event aggregation)
  it("should match totalRating and average rating with aggregated votes", async function () {
    await voting.connect(owner).addCandidate(1n)
    await voting.connect(owner).startVoting()

    const votes = [
      { voter: voter1, rating: 75n },
      { voter: voter2, rating: 25n },
    ]

    for (const vote of votes) {
      await voting.connect(vote.voter).submitVote(1n, vote.rating)
    }

    let totalRating = 0n
    for (const vote of votes) {
      totalRating += vote.rating
    }

    const [id, contractTotalRating, voteCount] = await voting.candidates(1n)

    expect(totalRating).to.equal(contractTotalRating)
    expect(voteCount).to.equal(BigInt(votes.length))
    expect(await voting.getAverageRating(1n)).to.equal(totalRating / BigInt(votes.length))
  })
})
