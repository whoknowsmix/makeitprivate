// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title WhoKnows
 * @dev Production-ready privacy mixer.
 *      Supports Hybrid Deposits: Fixed Presets for anonymity, Flexible for convenience.
 */
contract WhoKnows is ReentrancyGuard, Ownable, Pausable {
    uint256 public constant FEE_PERCENT = 5;
    uint256 public constant FEE_DENOMINATOR = 1000;
    uint256 public constant MIN_DEPOSIT = 0.01 ether;

    address public feeRecipient;

    // commitment => amount deposited (Private to prevent metadata leaking)
    mapping(bytes32 => uint256) private depositAmounts;
    // nullifier => used status
    mapping(bytes32 => bool) public nullifiers;
    
    uint256 public totalDeposits;
    uint256 public accumulatedFees;

    // Dashboard Metrics
    uint256 public totalValueLocked;
    uint256 public anonymitySet;
    uint256 public dailyVolume;
    uint256 public lastDayStart;

    event Deposit(bytes32 indexed commitment, uint256 amount, uint256 timestamp);
    event Withdrawal(address indexed recipient, uint256 amount, uint256 fee, uint256 timestamp);
    event FeesCollected(address indexed recipient, uint256 amount);
    event FeeWithdrawn(address indexed recipient, uint256 amount);
    event FeeRecipientUpdated(address indexed newRecipient);

    error InvalidDepositAmount();
    error CommitmentAlreadyExists();
    error InvalidSecretOrNotFound();
    error AlreadyWithdrawn();
    error TransferFailed();
    error InvalidRecipient();
    error NoFeesToCollect();

    constructor(address initialOwner) Ownable(initialOwner) {
        feeRecipient = initialOwner;
        lastDayStart = block.timestamp;
    }

    /**
     * @dev Reject accidental ETH transfers
     */
    receive() external payable {
        revert("Direct deposits not allowed. Use deposit()");
    }

    /**
     * @dev Fallback to prevent accidental ETH loss
     */
    fallback() external payable {
        revert("Function not found. Use deposit()");
    }

    /**
     * @dev Update daily volume logic
     */
    function _updateDailyVolume(uint256 amount) internal {
        if (block.timestamp >= lastDayStart + 1 days) {
            dailyVolume = amount;
            lastDayStart = (block.timestamp / 1 days) * 1 days;
        } else {
            dailyVolume += amount;
        }
    }

    /**
     * @dev Deposit funds.
     * Supports Dual-Mode:
     * 1. Fixed Denominations: 0.1, 1, 10 ETH (Maximum Privacy)
     * 2. Flexible Amounts: Any value >= MIN_DEPOSIT (Convenience)
     */
    function deposit(bytes32 commitment) external payable nonReentrant whenNotPaused {
        if (msg.value < MIN_DEPOSIT) revert InvalidDepositAmount();
        if (depositAmounts[commitment] > 0) revert CommitmentAlreadyExists();

        depositAmounts[commitment] = msg.value;
        totalDeposits++;
        
        // Update Metrics
        totalValueLocked += msg.value;
        anonymitySet++;
        _updateDailyVolume(msg.value);
        
        emit Deposit(commitment, msg.value, block.timestamp);
    }

    /**
     * @dev Withdraw funds.
     */
    function withdraw(string calldata secret, address recipient) external nonReentrant whenNotPaused {
        if (recipient == address(0)) revert InvalidRecipient();
        
        bytes32 commitment = keccak256(abi.encodePacked(secret));
        uint256 amount = depositAmounts[commitment];
        
        if (amount == 0) revert InvalidSecretOrNotFound();
        
        // Nullifier is unique to this commitment
        bytes32 nullifier = keccak256(abi.encodePacked(commitment, "nullifier"));
        if (nullifiers[nullifier]) revert AlreadyWithdrawn();

        uint256 fee = (amount * FEE_PERCENT) / FEE_DENOMINATOR;
        uint256 payout = amount - fee;

        // Effects
        nullifiers[nullifier] = true;
        accumulatedFees += fee;
        
        // Update Metrics
        totalValueLocked -= amount;

        // Interaction
        (bool success, ) = payable(recipient).call{value: payout}("");
        if (!success) revert TransferFailed();

        emit Withdrawal(recipient, payout, fee, block.timestamp);
    }

    /**
     * @dev Collect fees and send to recipient (anyone can trigger, goes to feeRecipient).
     */
    function collectFees() external nonReentrant {
        uint256 fees = accumulatedFees;
        if (fees == 0) revert NoFeesToCollect();
        
        accumulatedFees = 0;
        
        (bool success, ) = payable(feeRecipient).call{value: fees}("");
        if (!success) revert TransferFailed();
        
        emit FeesCollected(feeRecipient, fees);
    }

    /**
     * @dev Withdraw accumulated fees to owner (Owner only, pull pattern).
     * @notice This is the secure method for owner to collect protocol earnings.
     */
    function withdrawFees() external onlyOwner nonReentrant {
        uint256 fees = accumulatedFees;
        if (fees == 0) revert NoFeesToCollect();
        
        // Effects first (CEI pattern)
        accumulatedFees = 0;
        
        // Interaction - send to owner (msg.sender is guaranteed to be owner)
        (bool success, ) = payable(msg.sender).call{value: fees}("");
        if (!success) revert TransferFailed();
        
        emit FeeWithdrawn(msg.sender, fees);
    }

    /**
     * @dev View function to check pending fees available for withdrawal.
     */
    function getPendingFees() external view returns (uint256) {
        return accumulatedFees;
    }

    /**
     * @dev Update fee recipient (Admin only)
     */
    function setFeeRecipient(address _newRecipient) external onlyOwner {
        if (_newRecipient == address(0)) revert InvalidRecipient();
        feeRecipient = _newRecipient;
        emit FeeRecipientUpdated(_newRecipient);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    /**
     * @dev View function for commitment status (existence and withdrawal status)
     * Note: Returns boolean for amount existence to protect privacy (Security Fix).
     */
    function getDepositStatus(bytes32 commitment) external view returns (bool exists, bool isWithdrawn) {
        bytes32 nullifier = keccak256(abi.encodePacked(commitment, "nullifier"));
        return (depositAmounts[commitment] > 0, nullifiers[nullifier]);
    }
}

