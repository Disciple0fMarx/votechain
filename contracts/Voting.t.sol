// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {Voting} from "./Voting.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract VotingTest is Test {
    Voting voting;
    address owner = address(0x1);
    address voter1 = address(0x2);
    address voter2 = address(0x3);

    function setUp() public {
        // Deploy contract with owner
        vm.prank(owner);
        voting = new Voting();
    }

    function test_InitialState() public view {
        assertEq(voting.votingActive(), false, "Voting should be inactive initially");
        assertEq(voting.candidateCount(), 0, "Candidate count should be 0 initially");
        assertEq(voting.owner(), owner, "Owner should be set correctly");
    }

    function test_AddCandidate() public {
        vm.prank(owner);
        voting.addCandidate(1);
        (uint256 id, uint256 totalRating, uint256 voteCount) = voting.candidates(1);
        assertEq(id, 1, "Candidate ID should be 1");
        assertEq(totalRating, 0, "Initial total rating should be 0");
        assertEq(voteCount, 0, "Initial vote count should be 0");
        assertEq(voting.candidateCount(), 1, "Candidate count should be 1");
    }

    function testFail_AddCandidateNonOwner() public {
        vm.prank(voter1);
        voting.addCandidate(1); // Should revert
    }

    function test_StartAndEndVoting() public {
        vm.prank(owner);
        voting.startVoting();
        assertEq(voting.votingActive(), true, "Voting should be active after start");

        vm.prank(owner);
        voting.endVoting();
        assertEq(voting.votingActive(), false, "Voting should be inactive after end");
    }

    function test_SubmitVote(uint256 rating) public {
        vm.assume(rating <= 100); // Restrict fuzz input to valid ratings
        vm.prank(owner);
        voting.addCandidate(1);
        vm.prank(owner);
        voting.startVoting();

        vm.prank(voter1);
        voting.submitVote(1, rating);
        (, uint256 totalRating, uint256 voteCount) = voting.candidates(1);
        assertEq(totalRating, rating, "Total rating should match submitted rating");
        assertEq(voteCount, 1, "Vote count should be 1");
        assertEq(voting.hasVoted(voter1, 1), true, "Voter should be marked as voted");
        assertEq(voting.getAverageRating(1), rating, "Average rating should match");
    }

    function testFail_VoteWhenNotActive() public {
        vm.prank(owner);
        voting.addCandidate(1);

        vm.prank(voter1);
        voting.submitVote(1, 75); // Should revert (voting not active)
    }

    function testFail_InvalidRating() public {
        vm.prank(owner);
        voting.addCandidate(1);
        vm.prank(owner);
        voting.startVoting();

        vm.prank(voter1);
        voting.submitVote(1, 101); // Should revert (rating > 100)
    }

    function testFail_DoubleVoting() public {
        vm.prank(owner);
        voting.addCandidate(1);
        vm.prank(owner);
        voting.startVoting();

        vm.prank(voter1);
        voting.submitVote(1, 75);
        vm.prank(voter1);
        voting.submitVote(1, 50); // Should revert (already voted)
    }

    function testFail_InvalidCandidate() public {
        vm.prank(owner);
        voting.startVoting();

        vm.prank(voter1);
        voting.submitVote(999, 75); // Should revert (candidate doesn't exist)
    }
}
