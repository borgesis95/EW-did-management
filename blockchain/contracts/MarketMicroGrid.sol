// SPDX-License-Identifier: MIT

pragma solidity ^0.8.11;

contract MarketMicroGridContract {
    struct Offer {
        address user;
        /**
           minumum price which user is willing to sell
         */
        uint256 minPrice;
        uint creationDate;
    }

    struct Bid {
        address user;
        uint256 maxPrice;
        uint creationDate;
    }

    Offer[] public offers;
    Bid[] public bids;

    mapping(address => Offer[]) public userOffers;
    mapping(address => Bid[]) public userBids;

    mapping(address => int) public userPayment;

    /**Events */
    event OfferCreated(string message);
    event BidCreated(string message);
    event TransferReceived(address sender, uint256 value);
    event MoneyReceived(address sender, string message);

    /**Functions */
    function createOffer(
        address _address,
        uint256 _maxPrice,
        uint _creationDate
    ) external {
        offers.push(Offer(_address, _maxPrice, _creationDate));
        userOffers[_address].push(Offer(_address, _maxPrice, _creationDate));
        emit OfferCreated("Offer created succesfully");
    }

    function deleteAllOffers() external {
        delete offers;
    }

    function createBid(
        address _address,
        uint256 _minPrice,
        uint _creationDate
    ) external {
        bids.push(Bid(_address, _minPrice, _creationDate));
        userBids[_address].push(Bid(_address, _minPrice, _creationDate));
        emit BidCreated("Bid created");
    }

    function getOffers() public view returns (Offer[] memory) {
        return offers;
    }

    function getOffersByAddress(
        address _address
    ) public view returns (Offer[] memory) {
        return userOffers[_address];
    }

    function getBidsByAddress(
        address _address
    ) public view returns (Bid[] memory) {
        return userBids[_address];
    }

    function getBids() public view returns (Bid[] memory) {
        return bids;
    }

    // --- Payment ----

    function createPaymentTransaction(address _address, int _price) external {
        if (userPayment[_address] != 0) {
            userPayment[_address] = userPayment[_address] + _price;
        } else {
            userPayment[_address] = _price;
        }
    }

    /**
        This method is just to faciliate development
    */
    function resetPayment(address _address) external {
        userPayment[_address] = 0;
    }

    function getPaymentTransaction(address _address) public view returns (int) {
        return userPayment[_address];
    }

    function pay(int price) external payable {
        userPayment[msg.sender] = userPayment[msg.sender] + price;
        emit TransferReceived(msg.sender, msg.value);
    }

    function withDrawMoney(
        address payable _address,
        int _price,
        uint _wei
    ) public {
        require(address(this).balance > _wei, "Money not available");

        userPayment[msg.sender] = userPayment[msg.sender] - _price;
        _address.transfer(_wei);
        emit MoneyReceived(msg.sender, "moneys has been received");
    }

    function getContractBalance() public view returns (uint) {
        return address(this).balance;
    }
}
