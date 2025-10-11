import { expect } from "chai";
import { network } from "hardhat";
import { Contract, Signer } from "ethers";

const { ethers } = await network.connect();

describe("Voting", function () {
  let voting: any;
  let owner: Signer;
  let voter1: Signer;
  let voter2: Signer;

  beforeEach(async function () {
    [owner, voter1, voter2] = await ethers.getSigners();
    voting = await ethers.deployContract("Voting");
  });

  it("should have correct initial state", async function () {
    expect(await voting.votingActive()).to.equal(false);
    expect(await voting.candidateCount()).to.equal(0);
    expect(await voting.owner()).to.equal(await owner.getAddress());
  });

  it("should allow owner to add candidate", async function () {
    await voting.connect(owner).addCandidate(1);
    const [id, totalRating, voteCount] = await voting.candidates(1);
    expect(id).to.equal(1);
    expect(totalRating).to.equal(0);
    expect(voteCount).to.equal(0);
    expect(await voting.candidateCount()).to.equal(1);
  });

  it("should revert if non-owner adds candidate", async function () {
    await expect(voting.connect(voter1).addCandidate(1)).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
  });

  it("should allow owner to start and end voting", async function () {
    await voting.connect(owner).startVoting();
    expect(await voting.votingActive()).to.equal(true);

    await voting.connect(owner).endVoting();
    expect(await voting.votingActive()).to.equal(false);
  });

  it("should allow voting and calculate average rating", async function () {
    await voting.connect(owner).addCandidate(1);
    await voting.connect(owner).startVoting();

    await voting.connect(voter1).submitVote(1, 75);
    const [id, totalRating, voteCount] = await voting.candidates(1);
    expect(totalRating).to.equal(75);
    expect(voteCount).to.equal(1);
    expect(await voting.hasVoted(await voter1.getAddress(), 1)).to.equal(true);
    expect(await voting.getAverageRating(1)).to.equal(75);

    await voting.connect(voter2).submitVote(1, 25);
    expect(await voting.getAverageRating(1)).to.equal(50); // (75 + 25) / 2
  });

  it("should revert if voting when not active", async function () {
    await voting.connect(owner).addCandidate(1);
    await expect(voting.connect(voter1).submitVote(1, 75)).to.be.revertedWith(
      "Voting not active"
    );
  });

  it("should revert if rating exceeds 100", async function () {
    await voting.connect(owner).addCandidate(1);
    await voting.connect(owner).startVoting();
    await expect(voting.connect(voter1).submitVote(1, 101)).to.be.revertedWith(
      "Rating must be 0-100"
    );
  });

  it("should revert if voter votes twice", async function () {
    await voting.connect(owner).addCandidate(1);
    await voting.connect(owner).startVoting();
    await voting.connect(voter1).submitVote(1, 75);
    await expect(voting.connect(voter1).submitVote(1, 50)).to.be.revertedWith(
      "Already voted"
    );
  });

  it("should revert if voting for invalid candidate", async function () {
    await voting.connect(owner).startVoting();
    await expect(voting.connect(voter1).submitVote(999, 75)).to.be.revertedWith(
      "Invalid candidate"
    );
  });

  it("should revert if getting average rating with no votes", async function () {
    await voting.connect(owner).addCandidate(1);
    await expect(voting.getAverageRating(1)).to.be.revertedWith("No votes");
  });
});
