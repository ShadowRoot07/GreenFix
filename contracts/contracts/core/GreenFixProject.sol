// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
//import "@openzeppelin/contracts/security/Pausable.sol";// or 
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./ProjectToken.sol";
import "../libraries/ProjectState.sol";
import "../libraries/Errors.sol";


contract GreenFixProject is ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    uint256 public guarantee;
    bool public guaranteeDeposited;

    uint256 public constant MIN_INVESTMENT = 10 * 1e6; // 10 USDC
    //uint256 public constant MIN_INVESTMENT = 10 ether;

    // ────────────── STRUCTS ──────────────

    struct ProjectConfig {
        uint256 fundingGoal;
        uint256 interestBps;
        uint256 platformFeeBps;
        uint256 fundingDeadline;
        uint256 loanDurationInDays;
    }

    struct TimeConfig {
        uint256 votingDuration;
        uint256 repaymentInterval;
        uint256 gracePeriod;
        uint256 claimPeriod;
    }

    struct Milestone {
        uint8 percentage;
        uint256 amount;
        bool released;
        bool votingActive;
        bool extended;        // ← NUEVO
        uint256 voteStart;
        uint256 voteEnd;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 totalParticipation;
        string evidenceURI;
        uint256 nonce;        // ← NUEVO
    }

    struct Repayment {
        uint256 dueDate;
        uint256 amount;
        bool paid;
    }

    // ────────────── STATE VARIABLES ──────────────

    // Immutables
    address public factory;
    IERC20 public usdc;
    ProjectToken public projectToken;

    // Configuraciones
    ProjectConfig public config;
    TimeConfig public timeConfig;

    // Estados
    ProjectState public state;

    // Creador del proyecto (depositó garantía)
    address public creator;

    // Financiamiento
    uint256 public totalRaised;
    //uint256 public totalTokensMinted; // debe coincidir con totalRaised
    bool public fundingFinalized;

    // Registro de inversores
    address[] public investors;
    mapping(address => bool) public isInvestor;

    // Milestones
    Milestone[] public milestones;
    uint256 public currentMilestone;

    // Repayments
    Repayment[] public repayments;

    // Variables financieras separadas
    uint256 public totalPrincipalRepaid;
    uint256 public totalInterestRepaid;
    uint256 public totalReleased;       // fondos liberados al creador por milestones

    // Refunds
    uint256 public refundPool;          // capital restante + garantía
    mapping(address => bool) public hasClaimedRefund;

    // Rewards
    mapping(address => uint256) public claimedRewards;

    // Votaciones
    mapping(uint256 => mapping(address => uint256)) public hasVotedNonce;    // Votación de default activa
    bool public defaultVoteActive;
    address public feeCollector;
    // Contador de rechazos consecutivos
    uint256 public consecutiveRejectedMilestones;

    // Fee recolectado
    uint256 public platformFeeCollected;

    uint256 public refundTotalSupplySnapshot;   // Nuevo
    // ────────────── MODIFIERS ──────────────

    modifier onlyState(ProjectState expected) {
        if (state != expected) revert InvalidState(expected, state);
        _;
    }

    modifier onlyCreator() {
        if (msg.sender != creator) revert OnlyCreator();
        _;
    }

    modifier onlyInvestor() {
        if (!isInvestor[msg.sender]) revert OnlyInvestor();
        _;
    }

    modifier onlyFactory() {
        if (msg.sender != factory) revert OnlyFactory();
        _;
    }

    modifier onlyActiveVoting() {
        // Verificar que hay una votación en curso en algún milestone
        // Implementación detallada en Fase 8
        _;
    }

    // ────────────── EVENTS ──────────────

    event Invested(address indexed investor, uint256 amount, uint256 tokensMinted);
    event MilestoneVotingStarted(uint256 indexed milestoneId, uint256 startTime, uint256 endTime);
    event Voted(address indexed investor, uint256 indexed milestoneId, bool support, uint256 weight);
    event MilestoneApproved(uint256 indexed milestoneId);
    event FundsReleased(uint256 indexed milestoneId, uint256 amount);
    event RefundActivated();
    event RefundClaimed(address indexed investor, uint256 amount);
    event RepaymentMade(address indexed creator, uint256 amount);
    event ProjectCompleted();
    event ProjectDefaulted();
    event FundingCancelled();
    event FundingFinalized(uint256 totalRaised, uint256 milestonesCount);


    // ────────────── CONSTRUCTOR ──────────────

    constructor(
        address _factory,
        address _usdc,
        uint256 _fundingGoal,
        uint256 _interestBps,
        uint256 _platformFeeBps,
        uint256 _votingDuration,
        uint256 _repaymentInterval,
        uint256 _gracePeriod,
        uint256 _claimPeriod,
        uint256 _fundingDeadline,
        address _creator,
        uint256 _loanDurationInDays,
        uint256 _guarantee,
        address _feeCollector  // ← NUEVO
        //guarantee = _guarantee // solo guarda el monto, no se transfiere aún
    ) {
        factory = _factory;
        usdc = IERC20(_usdc);
        config = ProjectConfig({
            fundingGoal: _fundingGoal,
            interestBps: _interestBps,
            platformFeeBps: _platformFeeBps,
            fundingDeadline: _fundingDeadline,
            loanDurationInDays: _loanDurationInDays
        });
        timeConfig = TimeConfig({
            votingDuration: _votingDuration,
            repaymentInterval: _repaymentInterval,
            gracePeriod: _gracePeriod,
            claimPeriod: _claimPeriod
        });
        creator = _creator;
        state = ProjectState.Funding;
        guarantee = _guarantee;
        feeCollector = _feeCollector;  // ← NUEVO


        // Desplegar token del proyecto (no transferible)
        projectToken = new ProjectToken("GreenFix Project", "GPFT", address(this), factory);

        // El creador deposita garantía (se hace en constructor o antes)
        // require(usdc.transferFrom(creator, address(this), _guarantee), "Guarantee failed");
        // refundPool += _guarantee;
        if (_loanDurationInDays == 0) revert InvalidDuration();
        //if ((_loanDurationInDays * 1 days) % _repaymentInterval != 0) revert InvalidRepaymentInterval();
    }

    // ────────────── FUNCIONES (esqueleto) ──────────────
    // Las implementaremos fase por fase.
    // Por ahora, solo declaraciones vacías o con revert para que compile.
    function cancelFunding()
        external
        onlyState(ProjectState.Funding)
        onlyCreator
        whenNotPaused
    {
        state = ProjectState.Cancelled;

        refundPool = totalRaised + guarantee;

        //emit RefundActivated();
    }

    function requestMilestoneRelease(string calldata evidenceURI) 
        external 
        onlyState(ProjectState.Active) 
        onlyCreator 
        whenNotPaused 
    {
        // Verificar que hay milestones disponibles
        if (currentMilestone >= milestones.length) revert NoMoreMilestones();
        
        Milestone storage milestone = milestones[currentMilestone];
        
        // Verificar que no esté ya liberado
        if (milestone.released) revert MilestoneAlreadyReleased();
        
        // Verificar que no haya votación activa
        if (milestone.votingActive) revert VotingAlreadyActive();
        
        // Verificar que el proyecto no esté en default
        // (ya cubierto por onlyState(Active))
        
        // Guardar evidencia
        milestone.evidenceURI = evidenceURI;
        milestone.extended = false;
        // Iniciar votación
        milestone.votingActive = true; // false
        milestone.voteStart = block.timestamp;
        milestone.voteEnd = block.timestamp + timeConfig.votingDuration;
        milestone.votesFor = 0;
        milestone.votesAgainst = 0;
        milestone.totalParticipation = 0;
        // Limpiar votos anteriores del milestone
        milestone.extended = false;
        milestone.nonce++;
        
        // Cambiar estado a Voting
        state = ProjectState.Voting;
        
        emit MilestoneVotingStarted(currentMilestone, milestone.voteStart, milestone.voteEnd);
    }
    function vote(uint256 milestoneId, bool support) 
        external 
        onlyState(ProjectState.Voting) 
        onlyInvestor 
        whenNotPaused 
    {
        // Verificar que el milestone es el actual
        if (milestoneId != currentMilestone) revert InvalidMilestone();
        
        Milestone storage milestone = milestones[milestoneId];
        
        // Verificar que la votación esté activa
        if (!milestone.votingActive) revert VotingNotActive();
        
        // Verificar que no haya votado ya
        if (hasVotedNonce[milestoneId][msg.sender] == milestone.nonce) revert AlreadyVoted();
        
        // Verificar que la votación no haya terminado
        if (block.timestamp >= milestone.voteEnd) revert VotingEnded();
        
        // Obtener peso del voto = balance de tokens
        uint256 weight = projectToken.balanceOf(msg.sender);
        if (weight == 0) revert NoVotingPower();
        
        // Registrar voto
        hasVotedNonce[milestoneId][msg.sender] = milestone.nonce;
        
        if (support) {
            milestone.votesFor += weight;
        } else {
            milestone.votesAgainst += weight;
        }
        milestone.totalParticipation += weight;
        
        emit Voted(msg.sender, milestoneId, support, weight);
    }

    function finalizeVoting(uint256 milestoneId) 
    external 
    onlyState(ProjectState.Voting) 
    whenNotPaused 
{
    // Verificar que el milestone es el actual
    if (milestoneId != currentMilestone) revert InvalidMilestone();
    
    Milestone storage milestone = milestones[milestoneId];
    
    // Verificar que la votación esté activa
    if (!milestone.votingActive) revert VotingNotActive();
    
    // Verificar que haya terminado el tiempo
    //if (block.timestamp < milestone.voteEnd) revert VotingNotEnded();
    
    uint256 totalSupply = projectToken.totalSupply();
    if (totalSupply == 0) revert NoVotingPower();
    uint256 participationPercent = (milestone.totalParticipation * 100) / totalSupply;
    
    // Verificar quorum mínimo (51%)
    if (participationPercent < 51) {
        // Sin quorum: extender 24 horas (solo primera vez)
        if (!milestone.extended) {
            milestone.voteEnd += 24 hours;
            milestone.extended = true;
            return; // No finalizar aún
        } else {
            // Segunda vez sin quorum: rechazar automáticamente
            milestone.votingActive = false;
            milestone.released = false;
            consecutiveRejectedMilestones++;
            state = ProjectState.Active;
            
            if (consecutiveRejectedMilestones >= 2) {
                state = ProjectState.Defaulted;
                emit ProjectDefaulted();
            }
            return;
        }
    }
    
    // Verificar mayoría simple
    if (milestone.votesFor > milestone.votesAgainst) {
        // Aprobado
        milestone.released = true;
        milestone.votingActive = false;
        consecutiveRejectedMilestones = 0;
    if (usdc.balanceOf(address(this)) < milestone.amount) {
        revert NotEnoughBalance();
    }    
        // Liberar fondos al creador
        usdc.safeTransfer(creator, milestone.amount);
        totalReleased += milestone.amount;

        // Avanzar al siguiente milestone.
        // El proyecto NO se completa aquí: la finalización ocurre cuando el
        // creador termina de pagar la deuda (ver makeRepayment). Tras liberar
        // un milestone siempre volvemos a Active.
        currentMilestone++;
        state = ProjectState.Active;

        emit MilestoneApproved(milestoneId);
        emit FundsReleased(milestoneId, milestone.amount);
    } else {
        // Rechazado
        milestone.votingActive = false;
        milestone.released = false;
        consecutiveRejectedMilestones++;
        
        // Volver a Active
        state = ProjectState.Active;
        
        // Verificar doble rechazo
        if (consecutiveRejectedMilestones >= 2) {
            state = ProjectState.Defaulted;
            emit ProjectDefaulted();
        }
    }
}

    function makeRepayment(uint256 repaymentIndex) 
        external 
        onlyState(ProjectState.Active) 
        onlyCreator 
        whenNotPaused 
        nonReentrant
    {
        if (repaymentIndex >= repayments.length) revert InvalidRepayment();
        
        Repayment storage repayment = repayments[repaymentIndex];
        
        if (repayment.paid) revert PaymentAlreadyMade();

        if (repaymentIndex > 0 && !repayments[repaymentIndex - 1].paid) {
        revert PreviousRepaymentNotPaid();
    }
        
        uint256 amount = repayment.amount;
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        
        repayment.paid = true;
        
        // Separar capital e interés
        uint256 totalOwed = config.fundingGoal + ((config.fundingGoal * config.interestBps) / 10000);
        uint256 totalInterest = (config.fundingGoal * config.interestBps) / 10000;
        uint256 interestPortion = (amount * totalInterest) / totalOwed;
        uint256 principalPortion = amount - interestPortion;
        
        totalPrincipalRepaid += principalPortion;
        totalInterestRepaid += interestPortion;
        
        emit RepaymentMade(msg.sender, amount);
        
        // Verificar si TODAS las cuotas están pagadas
        bool allPaid = true;
        for (uint256 i = 0; i < repayments.length; i++) {
            if (!repayments[i].paid) {
                allPaid = false;
                break;
            }
        }
        
        if (allPaid) {
            state = ProjectState.Completed;
            emit ProjectCompleted();
        }
    }

    function triggerDefaultVote() 
        external 
        onlyState(ProjectState.Active) 
        whenNotPaused 
    {
        bool hasOverdue = false;
        for (uint256 i = 0; i < repayments.length; i++) {
            if (!repayments[i].paid && block.timestamp > repayments[i].dueDate + timeConfig.gracePeriod) {
                hasOverdue = true;
                break;
            }
        }
        
        if (!hasOverdue) revert NoOverduePayments();
        
        state = ProjectState.Defaulted;
        emit ProjectDefaulted();
    }

    function activateRefunds() 
        external 
        whenNotPaused 
    {
        if (state != ProjectState.Defaulted && state != ProjectState.Cancelled) {
            revert InvalidState(ProjectState.Defaulted, state);
        }
        
        refundPool = usdc.balanceOf(address(this));
        refundTotalSupplySnapshot = projectToken.totalSupply(); // ← SNAPSHOT
        
        state = ProjectState.Refunding;
        
        emit RefundActivated();
    }

    function claimRefund() 
        external 
        onlyInvestor 
        nonReentrant 
        whenNotPaused 
    {
        if (state != ProjectState.Refunding) {
            revert InvalidState(ProjectState.Refunding, state);
        }
        
        if (hasClaimedRefund[msg.sender]) {
            revert RefundAlreadyClaimed();
        }
        
        uint256 userTokens = projectToken.balanceOf(msg.sender);
        if (userTokens == 0) revert NoTokens();
        
        uint256 totalSupply = refundTotalSupplySnapshot; // ← USA SNAPSHOT
        uint256 refundAmount = (userTokens * refundPool) / totalSupply;
        
        if (refundAmount == 0) revert NoRefundAvailable();
        
        hasClaimedRefund[msg.sender] = true;
        
        projectToken.burn(msg.sender, userTokens);
        usdc.safeTransfer(msg.sender, refundAmount);
        
        emit RefundClaimed(msg.sender, refundAmount);
    }
    function claimRewards() 
        external 
        onlyInvestor 
        nonReentrant 
        whenNotPaused 
    {
        if (state != ProjectState.Completed) revert InvalidState(ProjectState.Completed, state);
        
        uint256 userTokens = projectToken.balanceOf(msg.sender);
        if (userTokens == 0) revert NoTokens();
        
        uint256 totalSupply = projectToken.totalSupply();
        if (totalSupply == 0) revert NoTokens();
        
        // El inversor recibe capital + interés proporcional
        uint256 totalRepaid = totalPrincipalRepaid + totalInterestRepaid;
        uint256 totalClaimable = (userTokens * totalRepaid) / totalSupply;
        uint256 alreadyClaimed = claimedRewards[msg.sender];
        
        if (totalClaimable <= alreadyClaimed) revert NoRewards();
        
        uint256 pending = totalClaimable - alreadyClaimed;
        
        // Fee de plataforma SOLO sobre la porción de interés
        uint256 interestPortion = (pending * totalInterestRepaid) / totalRepaid;
        uint256 platformFee = (interestPortion * config.platformFeeBps) / 10000;
        uint256 userReward = pending - platformFee;
        
        claimedRewards[msg.sender] = totalClaimable;
        platformFeeCollected += platformFee;
        
        if (userReward > 0) {
            usdc.safeTransfer(msg.sender, userReward);
        }
        if (platformFee > 0) {
            usdc.safeTransfer(feeCollector, platformFee);
        }
    }

    // Funciones auxiliares (vistas)
    function getMilestoneCount() external view returns (uint256) {
        return milestones.length;
    }

    function getRepaymentCount() external view returns (uint256) {
        return repayments.length;
    }

    function getRefundAmount(address investor) 
        external 
        view 
        returns (uint256) 
    {
        if (state != ProjectState.Refunding) {
            return 0;
        }
        
        uint256 userTokens = projectToken.balanceOf(investor);
        uint256 totalSupply = refundTotalSupplySnapshot; // ← USA SNAPSHOT
        
        if (userTokens == 0 || totalSupply == 0) {
            return 0;
        }
        
        return (userTokens * refundPool) / totalSupply;
    }

    function getPendingReward(address investor) external view returns (uint256) {
        revert("Not implemented");
    }
    function invest(uint256 amount)
        external
        onlyState(ProjectState.Funding)
        nonReentrant
        whenNotPaused
    {
        if (block.timestamp >= config.fundingDeadline)
            revert FundingDeadlineExceeded();

        if (!guaranteeDeposited)
            revert GuaranteeNotDeposited();

        if (totalRaised + amount > config.fundingGoal)
            revert OverfundingNotAllowed();

        if (amount < MIN_INVESTMENT)
            revert BelowMinimumInvestment();

        usdc.safeTransferFrom(
            msg.sender,
            address(this),
            amount
        );

        totalRaised += amount;

        projectToken.mint(msg.sender, amount);

        if (!isInvestor[msg.sender]) {
            isInvestor[msg.sender] = true;
            investors.push(msg.sender);
        }

        emit Invested(msg.sender, amount, amount);
    }
    function finalizeFunding()
        external
        onlyState(ProjectState.Funding)
        whenNotPaused
    {
        if (totalRaised != config.fundingGoal)
            revert FundingGoalNotReached();

        state = ProjectState.Active;

        fundingFinalized = true;

        uint8[4] memory percentages = [30, 30, 20, 20];

        uint256 remaining = config.fundingGoal;

        for (uint8 i = 0; i < percentages.length; i++) {

            uint256 milestoneAmount =
                (config.fundingGoal * percentages[i]) / 100;

            if (i == percentages.length - 1) {
                milestoneAmount = remaining;
            }

            milestones.push(
                Milestone({
                    percentage: percentages[i],
                    amount: milestoneAmount,
                    released: false,
                    votingActive: false,
                    extended: false,
                    voteStart: 0,
                    voteEnd: 0,
                    votesFor: 0,
                    votesAgainst: 0,
                    totalParticipation: 0,
                    evidenceURI: "",
                    nonce:0
                })
            );

            remaining -= milestoneAmount;
        }

        uint256 totalOwed =
            config.fundingGoal +
            ((config.fundingGoal * config.interestBps) / 10000);

        uint256 durationSeconds =
            config.loanDurationInDays * 1 days;

        uint256 intervalSeconds =
            timeConfig.repaymentInterval;

        uint256 numberOfPayments =
            durationSeconds / intervalSeconds;

        uint256 paymentAmount =
            totalOwed / numberOfPayments;

        uint256 remainder =
            totalOwed -
            (paymentAmount * numberOfPayments);

        uint256 dueDate =
            block.timestamp + intervalSeconds;

        for (uint256 i = 0; i < numberOfPayments; i++) {

            uint256 thisPayment = paymentAmount;

            if (i == numberOfPayments - 1) {
                thisPayment += remainder;
            }

            repayments.push(
                Repayment({
                    dueDate: dueDate,
                    amount: thisPayment,
                    paid: false
                })
            );

            dueDate += intervalSeconds;
        }

        emit FundingFinalized(
            totalRaised,
            milestones.length
        );
    }

    function depositGuarantee()
        external
        onlyCreator
        onlyState(ProjectState.Funding)
    {
        if (guaranteeDeposited)
            revert GuaranteeAlreadyDeposited();

        usdc.safeTransferFrom(
            msg.sender,
            address(this),
            guarantee
        );

        guaranteeDeposited = true;

        refundPool += guarantee;
    }
}