# P2P Market with blockchain

## Introduction

This project is part of my final step at University of Catania. The goal of this application (togheter with [Front-end application](https://github.com/borgesis95/EW-did-FE)) is the management of P2P electricity market with blockchain.

## Motivations

The goal of this project is to support fight against climate change. I've realized a project aim to build "market" in order to create offers and bids about electricty price.

### Getting started

Make sure you have:

- [NodeJS](https://nodejs.dev/)

- [MongoDB](https://www.mongodb.com/)

- [Truffle suite and Ganache](https://trufflesuite.com/docs/ganache/)

First of all you have to clone the repo:

```sh
git clone https://github.com/borgesis95/EW-did-management.git
cd EW-DID-MANAGEMENT
```

Install dependencies:

```sh
npm run install
```

Into the folder you can find `env.example` file which you can update in order to setup your local environment

```sh
cp .env.example .env
```

Start application with :

```sh
npm run start
```

###Smart contract

Within this repository you find a folder 'blockhain' which include a truffle project. You can deploy contract with command :

```sh
truffle deploy
```
