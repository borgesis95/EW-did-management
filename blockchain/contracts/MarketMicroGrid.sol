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

    struct SmartMisuration {
        address user;
        /* Define energy that has been generated from user */
        uint128 generated;
        /** Define energy that has been consumed from user in time range (es. each 15min ) */
        uint128 consumed;
    }

    struct Matching {
        address from;
        address to;
        uint256 price;
        uint256 quantity;
    }

    Offer[] public offers;
    Bid[] public bids;
    SmartMisuration[] public misuration;
    Matching[] public matching;
    Matching public matchTest;

    /**Events */
    event OfferCreated(string message);
    event BidCreated(string message);

    /**Functions */
    function createOffer(
        address _address,
        uint256 _maxPrice,
        uint _creationDate
    ) external {
        offers.push(Offer(_address, _maxPrice, _creationDate));
        emit OfferCreated("Offer created");
    }

    function createBid(
        address _address,
        uint256 _minPrice,
        uint _creationDate
    ) external {
        bids.push(Bid(_address, _minPrice, _creationDate));
        emit BidCreated("Bid created");
    }

    function addMisuration(
        address _address,
        uint128 _produced,
        uint128 _consumed
    ) external {
        misuration.push(SmartMisuration(_address, _produced, _consumed));
    }

    function getOffers() public view returns (Offer[] memory) {
        return offers;
    }

    function getBids() public view returns (Bid[] memory) {
        return bids;
    }

    function createMatch(Matching[] memory _matchingList) external {
        for (uint i = 0; i < _matchingList.length; i++) {
            matching.push(
                Matching(
                    _matchingList[i].from,
                    _matchingList[i].to,
                    _matchingList[i].price,
                    _matchingList[i].quantity
                )
            );
        }
    }

    function getMatch() public view returns (Matching[] memory) {
        return matching;
    }
}
