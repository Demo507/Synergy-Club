// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";

contract ClubMembership is ERC721, Ownable2Step {
    enum PaymentType { REGISTRATION, ACTIVATION }

    struct Payment {
        address payor;
        uint64 timestamp;
        PaymentType paymentType;
        uint128 amount;
    }

    uint256 public constant REGISTRATION_FEE = 0.0001 ether;
    uint256 public constant ACTIVATION_FEE = 0.01 ether;

    uint256 private _lastTokenId;
    string private _metadataURI;
    string private _contractURI;
    Payment[] private _payments;

    mapping(address => bool) public hasPaidRegistration;
    mapping(address => bool) public isApproved;
    mapping(address => bool) public isFullyActivated;
    mapping(address => bool) public isBanned;
    mapping(address => uint256) public tokenOf;

    event FeePaid(address indexed user, uint256 amount, PaymentType paymentType, uint256 timestamp);
    event MemberApproved(address indexed user);
    event MemberExpelled(address indexed user, uint256 tokenId);
    event Withdrawn(address indexed to, uint256 amount);
    event MetadataURIUpdated(string newURI);

    constructor(string memory metadataURI_, string memory contractURI_)
        ERC721("Synergy Shaking Hands Club", "SSHC")
        Ownable(msg.sender)
    {
        _metadataURI = metadataURI_;
        _contractURI = contractURI_;
        hasPaidRegistration[msg.sender] = true;
        isApproved[msg.sender] = true;
        isFullyActivated[msg.sender] = true;
        _mintMember(msg.sender);
    }

    // ---------- Membership flow ----------

    function payRegistrationFee() external payable {
        require(!isBanned[msg.sender], "Address is banned.");
        require(!hasPaidRegistration[msg.sender], "Registration fee already processed.");
        require(msg.value == REGISTRATION_FEE, "Incorrect registration amount.");

        hasPaidRegistration[msg.sender] = true;
        _record(PaymentType.REGISTRATION);
    }

    function approveApplicant(address applicant) external onlyOwner {
        require(hasPaidRegistration[applicant], "Applicant has not paid registration.");
        require(!isBanned[applicant], "Address is banned.");
        isApproved[applicant] = true;
        emit MemberApproved(applicant);
    }

    function completeFinalActivation() external payable {
        require(!isBanned[msg.sender], "Address is banned.");
        require(hasPaidRegistration[msg.sender], "Must pass registration phase first.");
        require(isApproved[msg.sender], "Not approved by admin.");
        require(!isFullyActivated[msg.sender], "Account already fully activated.");
        require(msg.value == ACTIVATION_FEE, "Incorrect activation amount.");

        isFullyActivated[msg.sender] = true;
        _mintMember(msg.sender);
        _record(PaymentType.ACTIVATION);
    }

    function expelMember(address member) external onlyOwner {
        require(member != owner(), "Cannot expel the owner.");
        uint256 id = tokenOf[member];
        require(id != 0, "Not a member.");

        _burn(id);
        tokenOf[member] = 0;
        isFullyActivated[member] = false;
        isApproved[member] = false;
        hasPaidRegistration[member] = false;
        isBanned[member] = true;

        emit MemberExpelled(member, id);
    }

    function unban(address user) external onlyOwner {
        isBanned[user] = false;
    }

    // ---------- Public payment list ----------

    function paymentCount() external view returns (uint256) {
        return _payments.length;
    }

    function getPayments(uint256 start, uint256 count) external view returns (Payment[] memory page) {
        uint256 total = _payments.length;
        if (start >= total) return new Payment[](0);
        uint256 end = start + count;
        if (end > total) end = total;
        page = new Payment[](end - start);
        for (uint256 i = start; i < end; i++) {
            page[i - start] = _payments[i];
        }
    }

    // ---------- Metadata (logo) ----------

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _metadataURI;
    }

    function contractURI() external view returns (string memory) {
        return _contractURI;
    }

    function setMetadataURI(string calldata newURI) external onlyOwner {
        _metadataURI = newURI;
        emit MetadataURIUpdated(newURI);
    }

    function setContractURI(string calldata newURI) external onlyOwner {
        _contractURI = newURI;
    }

    // ---------- Funds ----------

    function withdrawFunds() external onlyOwner {
        uint256 amount = address(this).balance;
        (bool ok, ) = payable(owner()).call{value: amount}("");
        require(ok, "Withdraw failed");
        emit Withdrawn(owner(), amount);
    }

    // ---------- Internals ----------

    function _mintMember(address to) private {
        _lastTokenId++;
        tokenOf[to] = _lastTokenId;
        _mint(to, _lastTokenId);
    }

    function _record(PaymentType paymentType) private {
        _payments.push(Payment(msg.sender, uint64(block.timestamp), paymentType, uint128(msg.value)));
        emit FeePaid(msg.sender, msg.value, paymentType, block.timestamp);
    }

    // Soulbound: mint and burn only
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        require(from == address(0) || to == address(0), "Non-transferable");
        return super._update(to, tokenId, auth);
    }
}
