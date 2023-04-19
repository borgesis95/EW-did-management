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

    struct Offer {
        address user;
        uint256 price;
        uint date;
    }

    struct EnergyRequest {
        address sender;
        uint256 price;
        uint256 quantityEnergy;
    }

    mapping(address => EnergyOffer) public eWOffersList;

    // Mapped betweeen address and offer
    mapping(address => Offer) public offers;

    mapping(address => uint) public tests;

    EnergyOffer[] public listOffers;
    EnergyRequest[] public listRequest;
    Offer[] public offersList;

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

    /**NEW  */
    function createOffer(address _address, uint price, uint date) external {
        Offer memory newOffer = Offer(_address, price, date);
        offers[_address] = newOffer;

        // Create a list of all
        offersList.push(Offer(_address, price, date));
    }

    function createTest(uint price) external {
        tests[msg.sender] = price;
    }

    function getTestById() public view returns (uint) {
        return tests[msg.sender];
    }

    function getOffersByUserAddress(
        address _address
    ) public view returns (Offer memory) {
        return offers[_address];
    }

    function getAllOffers() public view returns (Offer[] memory) {
        return offersList;
    }
}
