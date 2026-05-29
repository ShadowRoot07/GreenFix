// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IGreenFixFactory {
    function createProject(
        uint256 fundingGoal,
        uint256 interestBps,
        uint256 durationInDays,
        uint256 repaymentInterval,
        string calldata metadataURI
    ) external returns (uint256 projectId);

    function getProject(uint256 projectId) external view returns (
        address projectAddress,
        address creator,
        uint256 fundingGoal,
        uint256 createdAt,
        string memory metadataURI
    );
}