export const SYNERGY_CLUB_ABI=
[
{
"inputs": [
{ "internalType": "string", "name": "metadataURI_", "type": "string" },
{ "internalType": "string", "name": "contractURI_", "type": "string" }
],
"stateMutability": "nonpayable",
"type": "constructor"
},
{
"inputs": [
{ "internalType": "address", "name": "sender", "type": "address" },
{ "internalType": "uint256", "name": "tokenId", "type": "uint256" },
{ "internalType": "address", "name": "owner", "type": "address" }
],
"name": "ERC721IncorrectOwner",
"type": "error"
},
{
"inputs": [
{ "internalType": "address", "name": "operator", "type": "address" },
{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }
],
"name": "ERC721InsufficientApproval",
"type": "error"
},
{
"inputs": [{ "internalType": "address", "name": "approver", "type": "address" }],
"name": "ERC721InvalidApprover",
"type": "error"
},
{
"inputs": [{ "internalType": "address", "name": "operator", "type": "address" }],
"name": "ERC721InvalidOperator",
"type": "error"
},
{
"inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
"name": "ERC721InvalidOwner",
"type": "error"
},
{
"inputs": [{ "internalType": "address", "name": "receiver", "type": "address" }],
"name": "ERC721InvalidReceiver",
"type": "error"
},
{
"inputs": [{ "internalType": "address", "name": "sender", "type": "address" }],
"name": "ERC721InvalidSender",
"type": "error"
},
{
"inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
"name": "ERC721NonexistentToken",
"type": "error"
},
{
"inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
"name": "OwnableInvalidOwner",
"type": "error"
},
{
"inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
"name": "OwnableUnauthorizedAccount",
"type": "error"
},
{
"anonymous": false,
"inputs": [
{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
{ "indexed": true, "internalType": "address", "name": "approved", "type": "address" },
{ "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" }
],
"name": "Approval",
"type": "event"
},
{
"anonymous": false,
"inputs": [
{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
{ "indexed": true, "internalType": "address", "name": "operator", "type": "address" },
{ "indexed": false, "internalType": "bool", "name": "approved", "type": "bool" }
],
"name": "ApprovalForAll",
"type": "event"
},
{
"anonymous": false,
"inputs": [
{ "indexed": true, "internalType": "address", "name": "user", "type": "address" },
{ "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
{ "indexed": false, "internalType": "enum ClubMembership.PaymentType", "name": "paymentType", "type": "uint8" },
{ "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
],
"name": "FeePaid",
"type": "event"
},
{
"anonymous": false,
"inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address"
}],
"name": "MemberApproved",
"type": "event"
},
{
"anonymous": false,
"inputs": [
{ "indexed": true, "internalType": "address", "name": "user", "type": "address" },
{ "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" }
],
"name": "MemberExpelled",
"type": "event"
},
{
"anonymous": false,
"inputs": [{ "indexed": false, "internalType": "string", "name": "newURI", "type": "string" }],
"name": "MetadataURIUpdated",
"type": "event"
},
{
"anonymous": false,
"inputs": [
{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address"
},
{ "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }
],
"name": "OwnershipTransferStarted",
"type": "event"
},
{
"anonymous": false,
"inputs": [
{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address"
},
{ "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }
],
"name": "OwnershipTransferred",
"type": "event"
},
{
"anonymous": false,
"inputs": [
{ "indexed": true, "internalType": "address", "name": "from", "type": "address" },
{ "indexed": true, "internalType": "address", "name": "to", "type": "address" },
{ "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" }
],
"name": "Transfer",
"type": "event"
},
{
"anonymous": false,
"inputs": [
{ "indexed": true, "internalType": "address", "name": "to", "type": "address" },
{ "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
],
"name": "Withdrawn",
"type": "event"
},
{
"inputs": [],
"name": "ACTIVATION_FEE",
"outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [],
"name": "REGISTRATION_FEE",
"outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [],
"name": "acceptOwnership",
"outputs": [],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [
{ "internalType": "address", "name": "to", "type": "address" },
{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }
],
"name": "approve",
"outputs": [],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [{ "internalType": "address", "name": "applicant", "type": "address" }],
"name": "approveApplicant",
"outputs": [],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
"name": "balanceOf",
"outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [],
"name": "completeFinalActivation",
"outputs": [],
"stateMutability": "payable",
"type": "function"
},
{
"inputs": [],
"name": "contractURI",
"outputs": [{ "internalType": "string", "name": "", "type": "string" }],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [{ "internalType": "address", "name": "member", "type": "address" }],
"name": "expelMember",
"outputs": [],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
"name": "getApproved",
"outputs": [{ "internalType": "address", "name": "", "type": "address" }],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [
{ "internalType": "uint256", "name": "start", "type": "uint256" },
{ "internalType": "uint256", "name": "count", "type": "uint256" }
],
"name": "getPayments",
"outputs": [
{
"components": [
{ "internalType": "address", "name": "payor", "type": "address" },
{ "internalType": "uint64", "name": "timestamp", "type": "uint64" },
{ "internalType": "enum ClubMembership.PaymentType", "name": "paymentType", "type":
"uint8" },
{ "internalType": "uint128", "name": "amount", "type": "uint128" }
],
"internalType": "struct ClubMembership.Payment[]",
"name": "page",
"type": "tuple[]"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [{ "internalType": "address", "name": "", "type": "address" }],
"name": "hasPaidRegistration",
"outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [{ "internalType": "address", "name": "", "type": "address" }],
"name": "isApproved",
"outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [
{ "internalType": "address", "name": "owner", "type": "address" },
{ "internalType": "address", "name": "operator", "type": "address" }
],
"name": "isApprovedForAll",
"outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [{ "internalType": "address", "name": "", "type": "address" }],
"name": "isBanned",
"outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [{ "internalType": "address", "name": "", "type": "address" }],
"name": "isFullyActivated",
"outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [],
"name": "name",
"outputs": [{ "internalType": "string", "name": "", "type": "string" }],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [],
"name": "owner",
"outputs": [{ "internalType": "address", "name": "", "type": "address" }],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
"name": "ownerOf",
"outputs": [{ "internalType": "address", "name": "", "type": "address" }],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [],
"name": "payRegistrationFee",
"outputs": [],
"stateMutability": "payable",
"type": "function"
},
{
"inputs": [],
"name": "paymentCount",
"outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [],
"name": "pendingOwner",
"outputs": [{ "internalType": "address", "name": "", "type": "address" }],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [],
"name": "renounceOwnership",
"outputs": [],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [
{ "internalType": "address", "name": "from", "type": "address" },
{ "internalType": "address", "name": "to", "type": "address" },
{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }
],
"name": "safeTransferFrom",
"outputs": [],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [
{ "internalType": "address", "name": "from", "type": "address" },
{ "internalType": "address", "name": "to", "type": "address" },
{ "internalType": "uint256", "name": "tokenId", "type": "uint256" },
{ "internalType": "bytes", "name": "data", "type": "bytes" }
],
"name": "safeTransferFrom",
"outputs": [],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [
{ "internalType": "address", "name": "operator", "type": "address" },
{ "internalType": "bool", "name": "approved", "type": "bool" }
],
"name": "setApprovalForAll",
"outputs": [],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [{ "internalType": "string", "name": "newURI", "type": "string" }],
"name": "setContractURI",
"outputs": [],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [{ "internalType": "string", "name": "newURI", "type": "string" }],
"name": "setMetadataURI",
"outputs": [],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [{ "internalType": "bytes4", "name": "interfaceId", "type": "bytes4" }],
"name": "supportsInterface",
"outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [],
"name": "symbol",
"outputs": [{ "internalType": "string", "name": "", "type": "string" }],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [{ "internalType": "address", "name": "", "type": "address" }],
"name": "tokenOf",
"outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
"name": "tokenURI",
"outputs": [{ "internalType": "string", "name": "", "type": "string" }],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }],
"name": "transferOwnership",
"outputs": [],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [
{ "internalType": "address", "name": "from", "type": "address" },
{ "internalType": "address", "name": "to", "type": "address" },
{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }
],
"name": "transferFrom",
"outputs": [],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
"name": "unban",
"outputs": [],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [],
"name": "withdrawFunds",
"outputs": [],
"stateMutability": "nonpayable",
"type": "function"
}


] as const;