// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GreenFixProject.sol";
import "../interfaces/IGreenFixFactory.sol";

contract GreenFixFactory is IGreenFixFactory {
    struct ProjectInfo {
        address projectAddress;
        address creator;
        uint256 fundingGoal;
        uint256 createdAt;
        string metadataURI;
    }

    address public usdc;
    uint256 public defaultPlatformFeeBps;
    uint256 public defaultVotingDuration;
    uint256 public defaultGracePeriod;
    uint256 public defaultClaimPeriod;
    address public feeCollector;

    mapping(uint256 => ProjectInfo) public projects;
    uint256 public projectCount;

    event ProjectCreated(
        uint256 indexed projectId,
        address indexed creator,
        address projectAddress,
        uint256 fundingGoal,
        string metadataURI
    );

    constructor(
        address _usdc,
        uint256 _platformFeeBps,
        uint256 _votingDuration,
        uint256 _gracePeriod,
        uint256 _claimPeriod,
        address _feeCollector
    ) {
        usdc = _usdc;
        defaultPlatformFeeBps = _platformFeeBps;
        defaultVotingDuration = _votingDuration;
        defaultGracePeriod = _gracePeriod;
        defaultClaimPeriod = _claimPeriod;
        feeCollector = _feeCollector;
    }

    function createProject(
        uint256 fundingGoal,
        uint256 interestBps,
        uint256 durationInDays,
        uint256 repaymentInterval,
        string calldata metadataURI
    ) external override returns (uint256 projectId) {
        uint256 guarantee = (fundingGoal * 5) / 100;
    projectId = ++projectCount;

        uint256 fundingDeadline = block.timestamp + 30 days; // ejemplo fijo o parametrizable

        // Deploy del contrato de proyecto
        GreenFixProject project = new GreenFixProject(
            address(this),
            usdc,
            fundingGoal,
            interestBps,
            defaultPlatformFeeBps,
            defaultVotingDuration,
            repaymentInterval,
            defaultGracePeriod,
            defaultClaimPeriod,
            fundingDeadline,
            msg.sender,
            durationInDays,
            guarantee,
            feeCollector  
        );

        projects[projectId] = ProjectInfo({
            projectAddress: address(project),
            creator: msg.sender,
            fundingGoal: fundingGoal,
            createdAt: block.timestamp,
            metadataURI: metadataURI
        });

        emit ProjectCreated(projectId, msg.sender, address(project), fundingGoal, metadataURI);
    }

    function getProject(uint256 projectId) external view override returns (
        address projectAddress,
        address creator,
        uint256 fundingGoal,
        uint256 createdAt,
        string memory metadataURI
    ) {
        ProjectInfo memory p = projects[projectId];
        return (p.projectAddress, p.creator, p.fundingGoal, p.createdAt, p.metadataURI);
    }
}