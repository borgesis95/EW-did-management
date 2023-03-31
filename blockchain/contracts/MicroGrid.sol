// SPDX-License-Identifier: MIT

pragma solidity ^0.8.11;

contract MicroGridContract {
    struct EnergyOffer {
        address asset;
        uint256 price;
        uint startDate;
        uint endDate;
        uint256 quantityEnergy;
    }

    struct EnergyRequest {
        address sender;
        uint256 price;
        uint256 quantityEnergy;
    }

    mapping(address => EnergyOffer) public eWOffersList;
    EnergyOffer[] public listOffers;
    EnergyRequest[] public listRequest;

    /**
     * Events
     */

    event OfferCreated(string message);
    event RequestCreated(string message);

    function createEnergyOffer(
        address asset,
        uint256 price,
        uint startDate,
        uint endDate,
        uint256 quantityEnergy
    ) external {
        listOffers.push(
            EnergyOffer(asset, price, startDate, endDate, quantityEnergy)
        );
        emit OfferCreated("Offer has been created");
    }

    function createEnergyDemands(
        uint256 price,
        uint256 quantityEnergy
    ) external {
        listRequest.push(EnergyRequest(msg.sender, price, quantityEnergy));
        emit RequestCreated("Request has been created");
    }

    function getEnergyRequest()
        external
        view
        returns (EnergyRequest[] memory list)
    {
        list = listRequest;
        return list;
    }

    function getOffers() public view returns (EnergyOffer[] memory) {
        return listOffers;
    }
}
