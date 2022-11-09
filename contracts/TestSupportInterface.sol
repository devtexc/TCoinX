// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

contract UsingTestERC20 {
    using ERC165Checker for address;

    function addToken(address testAddress) external view {
        require(
            testAddress.supportsInterface(type(IERC20).interfaceId),
            "Address is not supported"
        );

        // store token now
    }
}
