// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract StakingDapp is Ownable, ReentrancyGuard {

    constructor(address initialOwner)
        Ownable(initialOwner)
    {}

    using SafeERC20 for IERC20;

    // =====================================================
    // STRUCTS
    // =====================================================

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
        string action;
        uint256 timestamp;
    }

    // =====================================================
    // QUEST SECURITY STORAGE
    // =====================================================

    address public signer;
    address public treasury;

    uint256 public MAX_TASK_REWARD = 1 ether;
    uint256 public MAX_DAILY_CLAIM = 50 ether;

    uint256 public claimAndStakeFee;
    uint256 public earlyWithdrawFee;

    mapping(bytes32 => bool) public usedHashes;
    mapping(address => uint256) public taskRewards;
    mapping(address => mapping(uint256 => uint256)) public dailyClaimed;

    // =====================================================
    // STAKING STORAGE
    // =====================================================

    uint256 public poolCount;
    PoolInfo[] public poolInfo;

    mapping(uint256 => mapping(address => UserInfo)) public userInfo;
    mapping(address => uint256) public depositedTokens;

    Notification[] public notifications;

    // =====================================================
    // ADMIN
    // =====================================================

    function setSigner(address _signer) external onlyOwner {
        signer = _signer;
    }

    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }

    function setFees(uint256 _claimFee, uint256 _earlyFee) external onlyOwner {
        claimAndStakeFee = _claimFee;
        earlyWithdrawFee = _earlyFee;
    }

    function setLimits(uint256 _maxTask, uint256 _dailyLimit) external onlyOwner {
        MAX_TASK_REWARD = _maxTask;
        MAX_DAILY_CLAIM = _dailyLimit;
    }

    function creditTaskReward(address user, uint256 amount) external onlyOwner {
        require(user != address(0), "Invalid user");
        require(amount > 0, "Invalid amount");
        taskRewards[user] += amount;
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

    // =====================================================
    // STAKING FROM WALLET FUNCTION
    // =====================================================

    function deposit(uint256 pid, uint256 amount, address user) external nonReentrant {
        require(pid < poolCount, "Invalid pool");
        require(amount > 0, "Invalid amount");
        require(user == msg.sender, "Invalid user");

        PoolInfo storage pool = poolInfo[pid];

        pool.depositToken.safeTransferFrom(msg.sender, address(this), amount);

        _stake(pid, amount);

        _createNotification(pid, amount, msg.sender, "Deposit");
    }

    // =====================================================
    // CORE QUEST FUNCTION (CLAIM + STAKE)
    // =====================================================

    function claimAndStake(
        uint256 pid,
        uint256 amount,
        uint256 poolId,
        uint256 nonce,
        uint256 deadline,
        bytes memory signature
    ) external payable nonReentrant {

        require(block.timestamp <= deadline, "Expired");
        require(pid == poolId, "Pool mismatch");
        require(poolId < poolCount, "Invalid pool");

    // Off-chain points model: do not check on-chain taskRewards here
    // require(amount <= taskRewards[msg.sender], "Exceeds reward balance");

        uint256 day = block.timestamp / 1 days;
        require(
            dailyClaimed[msg.sender][day] + amount <= MAX_DAILY_CLAIM,
            "Daily limit reached"
        );

        bytes32 messageHash = keccak256(
            abi.encodePacked(msg.sender, amount, poolId, nonce, deadline)
        );

        require(!usedHashes[messageHash], "Replay detected");

        bytes32 ethSigned = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );

        require(recoverSigner(ethSigned, signature) == signer, "Invalid signer");

        usedHashes[messageHash] = true;
        dailyClaimed[msg.sender][day] += amount;
        // taskRewards[msg.sender] -= amount;

        if (claimAndStakeFee > 0) {
            require(msg.value >= claimAndStakeFee, "Insufficient fee");
            payable(treasury).transfer(claimAndStakeFee);
        }

        _stake(pid, amount);

        _createNotification(pid, amount, msg.sender, "ClaimAndStake");
    }

    function _stake(uint256 pid, uint256 amount) internal {
        PoolInfo storage pool = poolInfo[pid];
        UserInfo storage user = userInfo[pid][msg.sender];

        pool.depositedAmount += amount;
        user.amount += amount;

        user.lastRewardAt = block.timestamp;
        user.lockUntil = block.timestamp + (pool.lockDays * 1 days);

        depositedTokens[address(pool.depositToken)] += amount;
    }

    // =====================================================
    // APY REWARD CLAIM
    // =====================================================

    function claimReward(uint256 pid) external nonReentrant {
        PoolInfo storage pool = poolInfo[pid];
        UserInfo storage user = userInfo[pid][msg.sender];

        uint256 reward = _calcReward(user, pid);
        require(reward > 0, "No reward");

        user.lastRewardAt = block.timestamp;

        pool.rewardToken.safeTransfer(msg.sender, reward);

        _createNotification(pid, reward, msg.sender, "ClaimReward");
    }

    // =====================================================
    // WITHDRAW (WITH BURN PENALTY)
    // =====================================================

    function withdraw(uint256 pid, uint256 amount) external payable nonReentrant {
        PoolInfo storage pool = poolInfo[pid];
        UserInfo storage user = userInfo[pid][msg.sender];

        require(user.amount >= amount, "Too much");

        uint256 reward = _calcReward(user, pid);

        bool early = block.timestamp < user.lockUntil;

        if (early && earlyWithdrawFee > 0) {
            require(msg.value >= earlyWithdrawFee, "Fee required");
            payable(treasury).transfer(earlyWithdrawFee);
        }

        if (reward > 0) {
            pool.rewardToken.safeTransfer(msg.sender, reward);
        }

        if (amount > 0) {
            user.amount -= amount;
            pool.depositedAmount -= amount;

            depositedTokens[address(pool.depositToken)] -= amount;

            if (early) {
                uint256 penalty = (amount * 50) / 100;
                uint256 userReceive = amount - penalty;

                pool.depositToken.safeTransfer(msg.sender, userReceive);

                pool.depositToken.safeTransfer(
                    0x000000000000000000000000000000000000dEaD,
                    penalty
                );
            } else {
                pool.depositToken.safeTransfer(msg.sender, amount);
            }
        }

        user.lastRewardAt = block.timestamp;

        _createNotification(pid, amount, msg.sender, "Withdraw");
    }

    // =====================================================
    // INTERNAL REWARD CALCULATION
    // =====================================================

    function _calcReward(UserInfo memory user, uint pid) internal view returns (uint256) {
        PoolInfo memory pool = poolInfo[pid];

        uint256 daysPassed = (block.timestamp - user.lastRewardAt) / 1 days;

        if (daysPassed > pool.lockDays) {
            daysPassed = pool.lockDays;
        }

        return (user.amount * daysPassed * pool.apy) / 36500;
    }

    function pendingReward(uint256 pid, address user) public view returns (uint256) {
        return _calcReward(userInfo[pid][user], pid);
    }

    // =====================================================
    // SIGNATURE RECOVERY
    // =====================================================

    function recoverSigner(bytes32 hash, bytes memory sig)
        internal pure returns (address)
    {
        (bytes32 r, bytes32 s, uint8 v) = split(sig);
        return ecrecover(hash, v, r, s);
    }

    function split(bytes memory sig)
        internal pure returns (bytes32 r, bytes32 s, uint8 v)
    {
        require(sig.length == 65, "bad sig");

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }

    // =====================================================
    // HELPERS
    // =====================================================

    function _createNotification(
        uint256 id,
        uint256 amount,
        address user,
        string memory action
    ) internal {
        notifications.push(Notification({
            poolID: id,
            amount: amount,
            user: user,
            action: action,
            timestamp: block.timestamp
        }));
    }

    function getNotifications() external view returns (Notification[] memory) {
        return notifications;
    }
}