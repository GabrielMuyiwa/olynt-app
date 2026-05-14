// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract StakingDapp is Ownable, ReentrancyGuard {
    constructor(address initialOwner) Ownable(initialOwner) {}

    using SafeERC20 for IERC20;

    struct UserInfo {
        uint256 amount;
        uint256 lastRewardAt;
        uint256 lockUntil;
    }

    struct PoolInfo {
        IERC20 depositToken;
        IERC20 rewardToken;
        uint256 depositedAmount;
        uint256 apy;
        uint256 lockDays;
    }

    struct Notification {
        uint256 poolID;
        uint256 amount;
        address user;
        string typeOf;
        uint256 timestamp;
    }

    // =========================
    // TASK SECURITY STORAGE
    // =========================

    mapping(address => uint256) public taskRewards;
    mapping(bytes32 => bool) public usedHashes; // 🔥 anti replay
    address public signer;

    uint256 public MAX_TASK_REWARD = 1 ether; // 🔥 limit per claim

    // =========================

    uint256 public poolCount;
    PoolInfo[] public poolInfo;

    mapping(uint256 => mapping(address => UserInfo)) public userInfo;
    mapping(address => uint256) public depositedTokens;

    Notification[] public notifications;

    // =========================
    // ADMIN
    // =========================

    function setSigner(address _signer) external onlyOwner {
        signer = _signer;
    }

    function setMaxTaskReward(uint256 _amount) external onlyOwner {
        MAX_TASK_REWARD = _amount;
    }

    function addPool(
        IERC20 _depositToken,
        IERC20 _rewardToken,
        uint256 _apy,
        uint256 _lockDays
    ) external onlyOwner {
        poolInfo.push(PoolInfo({
            depositToken: _depositToken,
            rewardToken: _rewardToken,
            depositedAmount: 0,
            apy: _apy,
            lockDays: _lockDays
        }));

        poolCount++;
    }

    // =========================
    // 🔥 SECURE TASK CLAIM
    // =========================

    function claimTaskReward(
        uint256 amount,
        uint256 nonce,
        uint256 deadline,
        bytes memory signature
    ) external nonReentrant {

        require(block.timestamp <= deadline, "Expired");
        require(amount <= MAX_TASK_REWARD, "Too large");

        bytes32 messageHash = keccak256(
            abi.encodePacked(msg.sender, amount, nonce, deadline)
        );

        require(!usedHashes[messageHash], "Already used");

        bytes32 ethSigned = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );

        address recovered = recoverSigner(ethSigned, signature);
        require(recovered == signer, "Invalid signer");

        usedHashes[messageHash] = true;

        taskRewards[msg.sender] += amount;

        _createNotification(0, amount, msg.sender, "TaskReward");
    }

    function withdrawTaskReward(uint256 _pid) external nonReentrant {
        uint256 reward = taskRewards[msg.sender];
        require(reward > 0, "No reward");

        taskRewards[msg.sender] = 0;

        IERC20 rewardToken = poolInfo[_pid].rewardToken;
        rewardToken.safeTransfer(msg.sender, reward);
    }

    // =========================
    // HELPERS
    // =========================

    function recoverSigner(bytes32 hash, bytes memory sig)
        internal pure returns (address)
    {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(sig);
        return ecrecover(hash, v, r, s);
    }

    function splitSignature(bytes memory sig)
        internal pure returns (bytes32 r, bytes32 s, uint8 v)
    {
        require(sig.length == 65, "Invalid signature");

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }

    function _createNotification(
        uint256 _id,
        uint256 _amount,
        address _user,
        string memory _typeOf
    ) internal {
        notifications.push(Notification({
            poolID: _id,
            amount: _amount,
            user: _user,
            typeOf: _typeOf,
            timestamp: block.timestamp
        }));
    }
}