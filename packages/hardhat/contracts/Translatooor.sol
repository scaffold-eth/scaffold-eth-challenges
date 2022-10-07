// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Translator is Ownable {
    using Counters for Counters.Counter;

    uint public reward;
    string[] public targetLanguages;
    string public originalArticleURL;
    uint public minimumNumberOfReviewers;

    struct TranslatedArticle {
        string URL;
        string language;
        address translator;
        bool approved;
        address[] reviewers;
    }

    Counters.Counter private _articlesIds;

    mapping(address => uint256) public balances;
    mapping(uint256 => TranslatedArticle) public articles;

    // ERRORS

    error EmptyURL();
    error AlreadyApproved();
    error IdDoesNotExists();
    error NotEnoughReviews();
    error UnsifficientFunds();
    error IsNotTargetLanguage();
    error CannotReviewSelfArticle();

    // EVENTS

    event TranslationSubmitted(uint256 _translationId, address _translator);
    event TranslationApproved(
        uint256 _translationId,
        address _translator,
        uint _reward
    );
    event TranslationReviewed(
        uint256 _translationId,
        address reviewer,
        string reason
    );

    // MODIFIERS

    modifier notApproved(uint256 _translationId) {
        if (articles[_translationId].approved == true) revert AlreadyApproved();
        _;
    }

    modifier notTranslator(uint256 _translationId) {
        if (msg.sender == articles[_translationId].translator)
            revert CannotReviewSelfArticle();
        _;
    }

    modifier isReviewed(uint256 _translationId) {
        if (
            articles[_translationId].reviewers.length < minimumNumberOfReviewers
        ) revert NotEnoughReviews();
        _;
    }

    constructor(
        string memory _originalArticleURL,
        string[] memory _targetLanguages,
        uint _minimumNumberOfReviewers
    ) payable {
        originalArticleURL = _originalArticleURL;
        targetLanguages = _targetLanguages;
        minimumNumberOfReviewers = _minimumNumberOfReviewers;
        reward = msg.value;
    }

    function proposeTranslation(
        string memory _translatedArticleURL,
        string memory _language
    ) public {
        if (bytes(_translatedArticleURL).length == 0) revert EmptyURL();
        if (!_isLanguageTarget(_language)) revert IsNotTargetLanguage();

        _articlesIds.increment();

        address[] memory reviewers;

        TranslatedArticle memory proposedArticle = TranslatedArticle(
            _translatedArticleURL,
            _language,
            msg.sender,
            false,
            reviewers
        );

        articles[_articlesIds.current()] = proposedArticle;

        emit TranslationSubmitted(_articlesIds.current(), msg.sender);
    }

    function approveTranslation(uint256 _id)
        public
        onlyOwner
        isReviewed(_id)
        notApproved(_id)
    {
        if (_id > _articlesIds.current()) revert IdDoesNotExists();

        uint256 amountToSend = reward / targetLanguages.length;
        uint256 amountToTranslator = (amountToSend * 9) / 10;
        uint256 amountToReviewers = (amountToSend * 1) /
            10 /
            articles[_id].reviewers.length;

        articles[_id].approved = true;
        balances[articles[_id].translator] += amountToTranslator;

        for (uint i = 0; i < articles[_id].reviewers.length; i++) {
            address reviewer = articles[_id].reviewers[i];
            balances[reviewer] += amountToReviewers;
        }

        emit TranslationApproved(_id, articles[_id].translator, amountToSend);
    }

    function getPayed() external {
        if (balances[msg.sender] <= 0) revert UnsifficientFunds();
        uint256 amountToWithdraw = balances[msg.sender];
        balances[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: amountToWithdraw}("");
        require(success, "tx failed");
    }

    function reviewTranslation(
        uint256 _id,
        bool _review,
        string memory reasons
    ) public notTranslator(_id) {
        if (_review) {
            articles[_id].reviewers.push(msg.sender);
        }
        emit TranslationReviewed(_id, msg.sender, reasons);
    }

    function _isLanguageTarget(string memory _language)
        internal
        view
        returns (bool)
    {
        for (uint256 i = 0; i < targetLanguages.length; i++) {
            if (
                keccak256(abi.encodePacked(targetLanguages[i])) ==
                keccak256(abi.encodePacked(_language))
            ) {
                return true;
            }
        }
        return false;
    }

    function withdrawFunds() external onlyOwner {
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "tx failed");
    }
} // SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Translator is Ownable {
    using Counters for Counters.Counter;

    uint public reward;
    string[] public targetLanguages;
    string public originalArticleURL;
    uint public minimumNumberOfReviewers;

    struct TranslatedArticle {
        string URL;
        string language;
        address translator;
        bool approved;
        address[] reviewers;
    }

    Counters.Counter private _articlesIds;

    mapping(address => uint256) public balances;
    mapping(uint256 => TranslatedArticle) public articles;

    // ERRORS

    error EmptyURL();
    error AlreadyApproved();
    error IdDoesNotExists();
    error NotEnoughReviews();
    error UnsifficientFunds();
    error IsNotTargetLanguage();
    error CannotReviewSelfArticle();

    // EVENTS

    event TranslationSubmitted(uint256 _translationId, address _translator);
    event TranslationApproved(
        uint256 _translationId,
        address _translator,
        uint _reward
    );
    event TranslationReviewed(
        uint256 _translationId,
        address reviewer,
        string reason
    );

    // MODIFIERS

    modifier notApproved(uint256 _translationId) {
        if (articles[_translationId].approved == true) revert AlreadyApproved();
        _;
    }

    modifier notTranslator(uint256 _translationId) {
        if (msg.sender == articles[_translationId].translator)
            revert CannotReviewSelfArticle();
        _;
    }

    modifier isReviewed(uint256 _translationId) {
        if (
            articles[_translationId].reviewers.length < minimumNumberOfReviewers
        ) revert NotEnoughReviews();
        _;
    }

    constructor(
        string memory _originalArticleURL,
        string[] memory _targetLanguages,
        uint _minimumNumberOfReviewers
    ) payable {
        originalArticleURL = _originalArticleURL;
        targetLanguages = _targetLanguages;
        minimumNumberOfReviewers = _minimumNumberOfReviewers;
        reward = msg.value;
    }

    function proposeTranslation(
        string memory _translatedArticleURL,
        string memory _language
    ) public {
        if (bytes(_translatedArticleURL).length == 0) revert EmptyURL();
        if (!_isLanguageTarget(_language)) revert IsNotTargetLanguage();

        _articlesIds.increment();

        address[] memory reviewers;

        TranslatedArticle memory proposedArticle = TranslatedArticle(
            _translatedArticleURL,
            _language,
            msg.sender,
            false,
            reviewers
        );

        articles[_articlesIds.current()] = proposedArticle;

        emit TranslationSubmitted(_articlesIds.current(), msg.sender);
    }

    function approveTranslation(uint256 _id)
        public
        onlyOwner
        isReviewed(_id)
        notApproved(_id)
    {
        if (_id > _articlesIds.current()) revert IdDoesNotExists();

        uint256 amountToSend = reward / targetLanguages.length;
        uint256 amountToTranslator = (amountToSend * 9) / 10;
        uint256 amountToReviewers = (amountToSend * 1) /
            10 /
            articles[_id].reviewers.length;

        articles[_id].approved = true;
        balances[articles[_id].translator] += amountToTranslator;

        for (uint i = 0; i < articles[_id].reviewers.length; i++) {
            address reviewer = articles[_id].reviewers[i];
            balances[reviewer] += amountToReviewers;
        }

        emit TranslationApproved(_id, articles[_id].translator, amountToSend);
    }

    function getPayed() external {
        if (balances[msg.sender] <= 0) revert UnsifficientFunds();
        uint256 amountToWithdraw = balances[msg.sender];
        balances[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: amountToWithdraw}("");
        require(success, "tx failed");
    }

    function reviewTranslation(
        uint256 _id,
        bool _review,
        string memory reasons
    ) public notTranslator(_id) {
        if (_review) {
            articles[_id].reviewers.push(msg.sender);
        }
        emit TranslationReviewed(_id, msg.sender, reasons);
    }

    function _isLanguageTarget(string memory _language)
        internal
        view
        returns (bool)
    {
        for (uint256 i = 0; i < targetLanguages.length; i++) {
            if (
                keccak256(abi.encodePacked(targetLanguages[i])) ==
                keccak256(abi.encodePacked(_language))
            ) {
                return true;
            }
        }
        return false;
    }

    function withdrawFunds() external onlyOwner {
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "tx failed");
    }
}
