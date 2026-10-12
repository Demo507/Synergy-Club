// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/ClubMembership.sol";

contract ClubMembershipTest is Test {
    ClubMembership club;
    address admin = makeAddr("admin");
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    uint256 constant REG = 0.0001 ether;
    uint256 constant ACT = 0.01 ether;

    function setUp() public {
        vm.prank(admin);
        club = new ClubMembership("ipfs://member", "ipfs://collection");
        vm.deal(alice, 1 ether);
        vm.deal(bob, 1 ether);
    }

    function _join(address user) internal {
        vm.prank(user);
        club.payRegistrationFee{value: REG}();
        vm.prank(admin);
        club.approveApplicant(user);
        vm.prank(user);
        club.completeFinalActivation{value: ACT}();
    }

    function test_AdminStartsActivated() public view {
        assertTrue(club.isFullyActivated(admin));
        assertEq(club.ownerOf(1), admin);
        assertEq(club.owner(), admin);
    }

    function test_RegistrationFee() public {
        vm.prank(alice);
        club.payRegistrationFee{value: REG}();
        assertTrue(club.hasPaidRegistration(alice));
        assertEq(club.paymentCount(), 1);
    }

    function test_RevertWrongFee() public {
        vm.prank(alice);
        vm.expectRevert("Incorrect registration amount.");
        club.payRegistrationFee{value: 0.5 ether}();
    }

    function test_RevertPayTwice() public {
        vm.startPrank(alice);
        club.payRegistrationFee{value: REG}();
        vm.expectRevert("Registration fee already processed.");
        club.payRegistrationFee{value: REG}();
        vm.stopPrank();
    }

    function test_RevertActivationBeforeRegistration() public {
        vm.prank(alice);
        vm.expectRevert("Must pass registration phase first.");
        club.completeFinalActivation{value: ACT}();
    }

    function test_RevertActivationBeforeApproval() public {
        vm.startPrank(alice);
        club.payRegistrationFee{value: REG}();
        vm.expectRevert("Not approved by admin.");
        club.completeFinalActivation{value: ACT}();
        vm.stopPrank();
    }

    function test_RevertApproveWithoutPayment() public {
        vm.prank(admin);
        vm.expectRevert("Applicant has not paid registration.");
        club.approveApplicant(alice);
    }

    function test_OnlyOwnerCanApprove() public {
        vm.prank(alice);
        club.payRegistrationFee{value: REG}();
        vm.prank(bob);
        vm.expectRevert();
        club.approveApplicant(alice);
    }

    function test_FullFlow() public {
        _join(alice);
        assertTrue(club.isFullyActivated(alice));
        assertEq(club.balanceOf(alice), 1);
        assertEq(club.tokenOf(alice), 2);
    }

    function test_Soulbound() public {
        _join(alice);
        vm.prank(alice);
        vm.expectRevert("Non-transferable");
        club.transferFrom(alice, bob, 2);
    }

    function test_ExpelBansMember() public {
        _join(alice);
        vm.prank(admin);
        club.expelMember(alice);
        assertFalse(club.isFullyActivated(alice));
        assertEq(club.balanceOf(alice), 0);
        vm.prank(alice);
        vm.expectRevert("Address is banned.");
        club.payRegistrationFee{value: REG}();
    }

    function test_CannotExpelOwner() public {
        vm.prank(admin);
        vm.expectRevert("Cannot expel the owner.");
        club.expelMember(admin);
    }

    function test_PaymentListAndWithdraw() public {
        _join(alice);
        ClubMembership.Payment[] memory p = club.getPayments(0, 10);
        assertEq(p.length, 2);
        assertEq(p[0].payor, alice);
        assertEq(uint256(p[1].amount), ACT);

        vm.prank(admin);
        club.withdrawFunds();
        assertEq(address(club).balance, 0);
        assertEq(admin.balance, REG + ACT);
    }

    function test_TokenURI() public view {
        assertEq(club.tokenURI(1), "ipfs://member");
    }
}
