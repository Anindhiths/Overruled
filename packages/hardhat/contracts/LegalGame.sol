// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LegalGame is Ownable {
    struct Case {
        uint256 caseId;
        string caseTitle;
        string caseDescription;
        address player;
        address opponent;
        uint256 playerScore;
        uint256 opponentScore;
        bool isActive;
        string currentPhase;
        string verdict;
    }

    struct Evidence {
        uint256 evidenceId;
        string description;
        bool isValid;
        uint256 impactScore;
    }

    mapping(uint256 => Case) public cases;
    mapping(uint256 => Evidence[]) public caseEvidence;
    mapping(address => uint256[]) public playerCases;
    
    uint256 private nextCaseId;
    uint256 private nextEvidenceId;

    event CaseCreated(uint256 indexed caseId, address indexed player, string caseTitle);
    event EvidenceSubmitted(uint256 indexed caseId, uint256 indexed evidenceId, address indexed submitter);
    event VerdictReached(uint256 indexed caseId, string verdict);
    event PhaseChanged(uint256 indexed caseId, string newPhase);
    event CaseWon(address player, uint256 caseId, uint256 reward);
    event CaseLost(address player, uint256 caseId);
    event RewardTokenSet(address token);

    IERC20 public rewardToken;
    uint256 public caseCounter;
    uint256 public constant REWARD_AMOUNT = 10 * 10**18; // 10 tokens

    mapping(address => uint256) public casesWon;
    mapping(address => uint256) public casesLost;
    mapping(address => uint256) public totalRewards;

    // Reward amounts
    uint256 public winReward = 100 * 10**18; // 100 tokens
    uint256 public tutorialReward = 10 * 10**18; // 10 tokens
    
    // Player statistics
    struct PlayerStats {
        uint256 casesWon;
        uint256 casesLost;
        uint256 tutorialsCompleted;
        uint256 totalRewardsEarned;
        bool hasCompletedTutorial;
    }
    
    mapping(address => PlayerStats) public playerStats;
    
    // Events
    event CaseCompleted(address player, bool won, uint256 reward);
    event TutorialCompleted(address player, uint256 reward);
    event RewardAmountUpdated(string rewardType, uint256 newAmount);

    constructor(address _rewardToken, address initialOwner) Ownable(initialOwner) {
        rewardToken = IERC20(_rewardToken);
        caseCounter = 0;
    }

    function setRewardToken(address _token) external onlyOwner {
        rewardToken = IERC20(_token);
        emit RewardTokenSet(_token);
    }

    function createCase(string memory _caseTitle, string memory _caseDescription) external returns (uint256) {
        uint256 caseId = nextCaseId++;
        cases[caseId] = Case({
            caseId: caseId,
            caseTitle: _caseTitle,
            caseDescription: _caseDescription,
            player: msg.sender,
            opponent: address(0),
            playerScore: 0,
            opponentScore: 0,
            isActive: true,
            currentPhase: "Opening",
            verdict: ""
        });
        
        playerCases[msg.sender].push(caseId);
        emit CaseCreated(caseId, msg.sender, _caseTitle);
        return caseId;
    }

    function submitEvidence(uint256 _caseId, string memory _description, bool _isValid) external {
        require(cases[_caseId].isActive, "Case is not active");
        require(msg.sender == cases[_caseId].player || msg.sender == cases[_caseId].opponent, "Not authorized");

        uint256 evidenceId = nextEvidenceId++;
        Evidence memory newEvidence = Evidence({
            evidenceId: evidenceId,
            description: _description,
            isValid: _isValid,
            impactScore: 0
        });

        caseEvidence[_caseId].push(newEvidence);
        emit EvidenceSubmitted(_caseId, evidenceId, msg.sender);
    }

    function updatePhase(uint256 _caseId, string memory _newPhase) external {
        require(cases[_caseId].isActive, "Case is not active");
        require(msg.sender == cases[_caseId].player || msg.sender == cases[_caseId].opponent, "Not authorized");
        
        cases[_caseId].currentPhase = _newPhase;
        emit PhaseChanged(_caseId, _newPhase);
    }

    function reachVerdict(uint256 _caseId, string memory _verdict) external {
        require(cases[_caseId].isActive, "Case is not active");
        require(msg.sender == cases[_caseId].player || msg.sender == cases[_caseId].opponent, "Not authorized");
        
        cases[_caseId].verdict = _verdict;
        cases[_caseId].isActive = false;
        emit VerdictReached(_caseId, _verdict);
    }

    function getCase(uint256 _caseId) external view returns (Case memory) {
        return cases[_caseId];
    }

    function getCaseEvidence(uint256 _caseId) external view returns (Evidence[] memory) {
        return caseEvidence[_caseId];
    }

    function getPlayerCases(address _player) external view returns (uint256[] memory) {
        return playerCases[_player];
    }

    function recordCaseWin(address player) external {
        require(msg.sender == owner() || msg.sender == player, "Unauthorized");
        
        caseCounter++;
        casesWon[player]++;
        
        if (address(rewardToken) != address(0)) {
            require(rewardToken.transfer(player, REWARD_AMOUNT), "Reward transfer failed");
            totalRewards[player] += REWARD_AMOUNT;
        }
        
        emit CaseWon(player, caseCounter, REWARD_AMOUNT);
    }

    function recordCaseLoss(address player) external {
        require(msg.sender == owner() || msg.sender == player, "Unauthorized");
        
        caseCounter++;
        casesLost[player]++;
        
        emit CaseLost(player, caseCounter);
    }

    function withdrawTokens(address token, uint256 amount) external onlyOwner {
        require(IERC20(token).transfer(owner(), amount), "Transfer failed");
    }

    // Record a case win and distribute reward
    function recordWin() external {
        require(playerStats[msg.sender].hasCompletedTutorial, "Must complete tutorial first");
        
        playerStats[msg.sender].casesWon++;
        playerStats[msg.sender].totalRewardsEarned += winReward;
        
        require(rewardToken.transfer(msg.sender, winReward), "Reward transfer failed");
        
        emit CaseCompleted(msg.sender, true, winReward);
    }
    
    // Record a case loss
    function recordLoss() external {
        require(playerStats[msg.sender].hasCompletedTutorial, "Must complete tutorial first");
        
        playerStats[msg.sender].casesLost++;
        emit CaseCompleted(msg.sender, false, 0);
    }
    
    // Complete tutorial and get reward
    function completeTutorial() external {
        require(!playerStats[msg.sender].hasCompletedTutorial, "Tutorial already completed");
        
        playerStats[msg.sender].hasCompletedTutorial = true;
        playerStats[msg.sender].tutorialsCompleted++;
        playerStats[msg.sender].totalRewardsEarned += tutorialReward;
        
        require(rewardToken.transfer(msg.sender, tutorialReward), "Tutorial reward transfer failed");
        
        emit TutorialCompleted(msg.sender, tutorialReward);
    }
    
    // Admin functions
    function setWinReward(uint256 _newReward) external onlyOwner {
        winReward = _newReward;
        emit RewardAmountUpdated("win", _newReward);
    }
    
    function setTutorialReward(uint256 _newReward) external onlyOwner {
        tutorialReward = _newReward;
        emit RewardAmountUpdated("tutorial", _newReward);
    }
    
    // View functions
    function getPlayerStats(address _player) external view returns (PlayerStats memory) {
        return playerStats[_player];
    }
} 