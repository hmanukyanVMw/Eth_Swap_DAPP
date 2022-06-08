// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./Token.sol";
import "hardhat/console.sol";


contract EthSwap {
    string public name = "EthSwap Instant Exchange";
    Token public token;
    uint public rate = 100;

    event Response(bool success, bytes data);
    event TokenPurchased(
        address account,
        address token,
        uint amount,
        uint rate
    );

    event TokensSold(
        address account,
        address token,
        uint amount,
        uint rate
    );

    constructor(Token _token) {
        token = _token;
    }

    function buyTokens() public payable {
        uint tokenAmount = msg.value * rate;

        require(token.balanceOf(address (this)) >= tokenAmount, "address (this)) >= tokenAmount which is wrong");
        token.transfer(msg.sender, tokenAmount);

        emit TokenPurchased(msg.sender, address(token), tokenAmount, rate);
    }

    function sellTokens(uint _amount) public {
        // User can't sell more tokens than they have
        require(token.balanceOf(msg.sender) >= _amount, "token.balanceOf need to be greater then _amount");

        // Calculate the amount of Ether to redeem
        uint etherAmount = _amount / rate;

        // Require that EthSwap has enough Ether
        require(address(this).balance >= etherAmount, "require address this.balance >= etherAmount");

        // Perform sale
        token.transferFrom(msg.sender, address(this), _amount);
        (bool success, bytes memory data) = payable(msg.sender).call{value: etherAmount}("");

        require(success, "transaction failed");
        // Emit an event
        emit Response(success, data);

        emit TokensSold(msg.sender, address(token), _amount, rate);
    }
}

