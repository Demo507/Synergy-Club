// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/ClubMembership.sol";

contract DeployClub is Script {
    function run() external returns (ClubMembership club) {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        string memory metadataURI = vm.envString("METADATA_URI");
        string memory collectionURI = vm.envString("CONTRACT_URI");

        vm.startBroadcast(pk);
        club = new ClubMembership(metadataURI, collectionURI);
        vm.stopBroadcast();

        console.log("ClubMembership deployed at:", address(club));
    }
}
