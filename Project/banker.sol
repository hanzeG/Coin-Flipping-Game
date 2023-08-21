// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

contract Bank{
    address payable owner;
    uint256 stage;
    address payable[2] players;
    bytes32[2] hashes;
    uint256[2] values;
    uint256[2] deposits;
    uint256 winner;

    constructor() {
        owner = payable(address(0x2E8951C0F001Bd28C40d86fB39f550B956fB4dE4));
    }

    function get_stage() public view returns (uint256) {
        return stage;
    }

    function get_winner() public view returns (uint256) {
        return winner;
    }


    function get_players() public view returns (address, address){
        return (players[0], players[1]);
    }

    function get_values() public view returns (uint256, uint256){
        return (values[0], values[1]);
    }

    function init_game() public{
        stage = 0;
        values[0] = 0;
        values[1] = 0;
        players[0] = payable (address(0));
        players[1] = payable (address(0));
        winner = 0;
    }

    function set_commitment(uint256 commitment) public  payable {
        require(msg.value == 20 ether, "The value sent should be exactly 20 ether.");
        require(stage == 0 || stage == 1, "Invalid stage for this operation.");
        if (stage == 0){
            players[0] = payable (msg.sender);
            hashes[0] = bytes32(commitment);
            deposits[0] = msg.value;
        } else if(stage == 1){
            players[1] = payable (msg.sender);
            hashes[1] = bytes32(commitment);
            deposits[1] = msg.value;
        } else {
            revert();
        }
        stage += 1;
    }

    function reveal(uint256 value) public {
        if (msg.sender == players[0]){
            require(stage == 3 , "stage == 3");
            require(hashes[0] == sha256(abi.encodePacked(value)),"require(hashes[0] == sha256(abi.encodePacked(value))");
            values[0] = value;
        }
        else if (msg.sender == players[1]){
            require(stage == 2 , "stage == 2");//Bob Must Reveal First
            require(hashes[1] == sha256(abi.encodePacked(value)),"require(hashes[0] == sha256(abi.encodePacked(value))");
            values[1] = value;
        }
        else {
            revert();
        }
        stage += 1;
    }

    function settle() public {
        require(stage ==4, "stage ==4)");
        if (values[0] % 2 == values[1] % 2){
            players[0].transfer(((deposits[0] + deposits[1]) * 19) / 20);
            winner = 1;
        }
        else {
            players[1].transfer(((deposits[0] + deposits[1]) * 19) / 20);
            winner = 2;
        }
        owner.transfer((deposits[0] + deposits[1]) / 20);
        stage += 1;
    }
}