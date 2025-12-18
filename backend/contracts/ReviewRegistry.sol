// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

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

    event ReviewSubmitted(uint256 reviewId, address indexed reviewer, string placeId, string ipfsHash, uint256 timestamp);
    event ReviewVoted(uint256 reviewId, address indexed voter, int8 vote, uint256 timestamp);

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

        emit ReviewSubmitted(reviewCount, msg.sender, placeId, ipfsHash, block.timestamp);
        reviewCount++;
    }

    function voteReview(uint256 reviewId, int8 vote) external {
        require(reviewId < reviewCount, "Review does not exist");
        require(vote == 1 || vote == -1, "Vote must be +1 or -1");

        Review storage review = reviews[reviewId];
        review.reputationScore += vote;
        userReputation[review.reviewer] += vote;

        emit ReviewVoted(reviewId, msg.sender, vote, block.timestamp);
    }

    function getReview(uint256 reviewId) external view returns (Review memory) {
        require(reviewId < reviewCount, "Review does not exist");
        return reviews[reviewId];
    }

    function getUserReputation(address user) external view returns (int256) {
        return userReputation[user];
    }

    function getScore(uint256 reviewId) external view returns (int256) {
        return reviews[reviewId].reputationScore;
    }

    struct Reply {
        address author;
        string ipfsHash;
        uint256 timestamp;
        uint256 parentReviewId;
        uint256 parentReplyId;
    }

    mapping(uint256 => Reply[]) public repliesByReview;

    event ReplyAdded(uint256 indexed reviewId, uint256 indexed replyIndex, address indexed author, string ipfsHash);

    function addReply(uint256 reviewId, string calldata ipfsHash, uint256 parentReplyId) external {
        Reply memory r = Reply({
            author: msg.sender,
            ipfsHash: ipfsHash,
            timestamp: block.timestamp,
            parentReviewId: reviewId,
            parentReplyId: parentReplyId
        });

        repliesByReview[reviewId].push(r);
        emit ReplyAdded(reviewId, repliesByReview[reviewId].length - 1, msg.sender, ipfsHash);
    }

    function getReplyCount(uint256 reviewId) external view returns (uint256) {
        return repliesByReview[reviewId].length;
    }

    function getReply(uint256 reviewId, uint256 index) external view returns (address author, string memory ipfsHash, uint256 timestamp, uint256 parentReplyId) {
        Reply[] storage replies = repliesByReview[reviewId];
        Reply storage reply = replies[index];
        return (reply.author, reply.ipfsHash, reply.timestamp, reply.parentReplyId);
    }
}
