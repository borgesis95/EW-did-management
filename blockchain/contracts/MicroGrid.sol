// SPDX-License-Identifier: MIT

pragma solidity ^0.8.11;

contract MicroGridContract {
    struct EnergyOffer {
        address asset;
        uint256 price;
        uint startDate;
        uint endDate;
    }

    mapping(address => EnergyOffer) public eWOffersList;
    EnergyOffer[] public listOffers;

    /**
     * Events
     */

    event OfferCreated(string message);

    function createEnergyOffer(
        address asset,
        uint256 price,
        uint startDate,
        uint endDate
    ) external {
        listOffers.push(EnergyOffer(asset, price, startDate, endDate));
        emit OfferCreated("Offer has been created");
    }

    function getOffers() external view returns (EnergyOffer[] memory list) {
        list = listOffers;
        return list;
    }
}
