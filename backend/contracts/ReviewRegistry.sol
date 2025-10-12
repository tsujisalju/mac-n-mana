// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

contract ReviewRegistry {
    struct Review {
        address reviewer;
        string placeId;
        string ipfsHash;
        uint8 rating;
        uint256 timestamp;
        int256 reputationScore;
    }

    mapping(uint256 => Review) public reviews; //store reviews by ID
    uint256 public reviewCount; //increment ID for each new review

    mapping(address => int256) public userReputation; //track reputation score for each ReviewRegistry

    event ReviewSubmitted(uint256 indexed reviewId, address indexed reviewer, string placeId);
    event ReviewVoted(uint256 indexed reviewId, address indexed voter, int8 vote);

    function submitReview(string memory placeId, string memory ipfsHash, uint8 rating) external {
        require(rating >= 1 && rating <= 5, "Invalid rating");
        reviews[reviewCount] = Review({
            reviewer: msg.sender,
            placeId: placeId,
            ipfsHash: ipfsHash,
            rating: rating,
            timestamp: block.timestamp,
            reputationScore: 0
        });

        emit ReviewSubmitted(reviewCount, msg.sender, placeId);
        reviewCount++;
    }

    function voteReview(uint256 reviewId, int8 vote) external {
        require(reviewId < reviewCount, "Review does not exist");
        require(vote == 1 || vote == -1, "Vote must be +1 or -1");

        Review storage review = reviews[reviewId];
        review.reputationScore += vote;
        userReputation[review.reviewer] += vote;

        emit ReviewVoted(reviewId, msg.sender, vote);
    }

    function getReview(uint256 reviewId) external view returns (Review memory) {
        require(reviewId < reviewCount, "Review does not exist");
        return reviews[reviewId];
    }

    function getUserReputation(address user) external view returns (int256) {
        return userReputation[user];
    }
}
