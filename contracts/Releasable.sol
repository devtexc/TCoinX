// SPDX-License-Identifier: UNLICENSED

/*
In order to use this contract to the fullest potential, please follow the below instructions:
0. Start a contract from a template such as a token, LP, or NFT contract. Open Zeppelin's wizard may be helpful to start.
1. Import this contract along with Open Zeppelin's AccessControl.
2. Add AccessControl to the contract declarations.
3. Add `address[] memory __disallowed, bool __mutable` to the constructor arguments.
4. Add `ReleasableLite(__disallowed, __mutable) payable` to the constructor modifiers.
5. Add the following functions to the contract:
    function allowToken(address token) public onlyRole(DEFAULT_ADMIN_ROLE) {_allowToken(token);}
    function disallowToken(address token) public onlyRole(DEFAULT_ADMIN_ROLE) {_disallowToken(token);}
    function lockAllowToken() public onlyRole(DEFAULT_ADMIN_ROLE) {_lockAllowToken();}
    function lockDisallowToken() public onlyRole(DEFAULT_ADMIN_ROLE) {_lockDisallowToken();}
    function releaseAllETH(address payable account) public onlyRole(DEFAULT_ADMIN_ROLE) {_releaseAllETH(account);}
    function releaseETH(address payable account, uint256 amount) public onlyRole(DEFAULT_ADMIN_ROLE) {_releaseETH(account, amount);}
    function releaseAllERC20(IERC20 token, address account) public onlyRole(DEFAULT_ADMIN_ROLE) {_releaseAllERC20(token, account);}
    function releaseERC20(IERC20 token, address account, uint256 amount) public onlyRole(DEFAULT_ADMIN_ROLE) {_releaseERC20(token, account, amount);}
    function releaseERC721(IERC721 token, address account, uint256 tokenId) public onlyRole(DEFAULT_ADMIN_ROLE) {_releaseERC721(token, account, tokenId);}
6. When deploying, add disallowed token addresses, such as the two sides to a liquidity pair, a test token, or a known investor tokens. Example:  ["0xTEST_TOKEN"] or []
7. Use the allowToken and disallowToken functions to update the disallowed token list. 
8. To make the disallowed list immutable, use the lockAllowToken and lockDisallowToken functions to prevent subtractions and additions, respectively.
NOTES:
 - To use Ownable instead of access control...
    1) Replace AccessControl with Ownable in the imports and contract declarations.
    2) Replace onlyRole(DEFAULT_ADMIN_ROLE) with OnlyOwner.
    3) Remove the supportsInterface function, since there are no more redundancies requiring an override.
 - There are several other ways to make the disallowed list immutable (to show there is no backdoor for supposedly secure funds):
    1) Set __mutable to false when deploying contract.
    2) Call the lockAllowToken() and lockDisallowToken() functions in the constructor function.
    3) Neglect to add allowToken() and disallowToken() to the contract.
    4) Renounce admin/owner and any applicable roles.
 - This is the Lite version of the contract which does not accept ERC1155 tokens, since they can't get stuck in an incompatible contract.
 - Disallowing the raw network token will not work. Here are some alternatives to disable their release:
    1) Neglect to add the releaseAllETH and releaseETH functions to the contract
    2) Use access control to create a lite admin role for all other releases and revoke admin role.
    3) Employ the use of wrapped tokens.
*/

pragma solidity ^0.8.17; // Solidity must be 0.8.0 or higher.

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol"; // IERC20 imported to use IERC20 indexed variable.
import "@openzeppelin/contracts/token/ERC721/IERC721.sol"; // IERC721 imported to use IERC721 indexed variable.
import "@openzeppelin/contracts/utils/Address.sol"; // Address imported to use address()

abstract contract Releasable {
    
    using Address for address;

    /// @dev Events defined for any contract changes.
    event ReleasedETH(address to, uint256 amount); // Emits event "Released ETH" when network tokens have been released, returning recipient and amount.
    event ReleasedERC20(IERC20 indexed token, address to, uint256 amount); // Emits event "Released ERC20" when ERC20 tokens have been released, returning token, recipient, and amount.
    event ReleasedERC721(IERC721 indexed token, address to, uint256 tokenId); // Emits event "Released ERC721" when ERC721 tokens have been released, returning token, recipient, and ID.

    /// @dev External payable function allows contract to receive ETH.
    receive() external payable virtual {}

    /// @dev Internal virtual functions perform the requested contract updates and emit the events to the blockchain.
    function _releaseAllETH(address payable account) internal virtual {
        // Releases all network tokens from contract.
        uint256 amount = address(this).balance; // Sets payment to the contract's network token balance.
        _releaseETH(account, amount); // Calls the _releaseETH function with total balance.
    }

    function _releaseETH(address payable account, uint256 amount) internal virtual {
        // Releases specified amount of network tokens from contract.
        uint256 totalBalance = address(this).balance; // Gets the contract's total network token balance
        require(totalBalance != 0, "Releasable: no network tokens to release"); // Throws call if there are no network tokens to release.
        require(
            totalBalance >= amount,
            "Releasable: not enough network tokens to release"
        ); // Throws call if the requested amount is greater than the balance.
        Address.sendValue(account, amount); // Sends the network tokens securely via the the sendValue call.
        emit ReleasedETH(account, amount); // Emits the "Released ETH" event to the blockchain.
    }

    function _releaseAllERC20(IERC20 token, address account) internal virtual {
        // Releases all of a specified ERC20 token from contract.
        uint256 amount = token.balanceOf(address(this)); // Sets payment to the contract's ERC20 token balance.
        _releaseERC20(token, account, amount); // Calls the _releaseERC20 function with total balance.
    }

    /// @dev Internal functions allow external calls to NFT's for transfering.
    function _releaseERC20(IERC20 token, address account, uint256 amount) internal virtual {
        // Releases specified amount of ERC20 tokens from contract.
        uint256 totalBalance = token.balanceOf(address(this)); // Gets the contract's total ERC20 balance
        require(totalBalance != 0, "Releasable: no ERC20 tokens to release"); // Throws call if there are no ERC20 tokens to release.
        require(
            totalBalance >= amount,
            "Releasable: not enough ERC20 tokens to release"
        ); // Throws call if the requested amount is greater than the balance.
        SafeERC20.safeTransfer(token, account, amount); // Sends the ERC20 tokens securely via the the safeTransfer call.
        emit ReleasedERC20(token, account, amount); // Emits the "Released ERC20" event to the blockchain.
    }

    function _callOptionalReturnERC721(IERC721 token, bytes memory data)
        private
    {
        // Used in the _releaseERC721(..) private function to execute the transfer.
        bytes memory returndata = address(token).functionCall(
            data,
            "Releasable: low-level call failed"
        ); // Executes transfer function. Throws the call if ERC721 is not responsive.
        if (returndata.length > 0) {
            require(
                abi.decode(returndata, (bool)),
                "Releasable: ERC721 operation did not succeed"
            ); // Sends back an error if ERC721 returns no data.
        }
    }

    function _releaseERC721(
        IERC721 token,
        address account,
        uint256 tokenId
    ) internal virtual {
        // Releases specified ERC721 NFT from contract.
        address owner = token.ownerOf(tokenId); // Gets the owner of the specified ERC721 NFT.
        require(
            owner == address(this),
            "Releasable: contract is not owner of ERC721 NFT"
        ); // Throws the call if the owner of the NFT is not the contract.
        _callOptionalReturnERC721(
            token,
            abi.encodeWithSelector(
                token.transferFrom.selector,
                address(this),
                account,
                tokenId
            )
        ); // Sends the ERC721 via transferFrom abi call.
        // Unable to use "safeTransferFrom" due to "not unique after argument-dependent lookup" error.
        emit ReleasedERC721(token, account, tokenId); // Emits the "Released ERC721" event to the blockchain.
    }
}
