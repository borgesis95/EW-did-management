module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: 1337
    },
    loc_development_development: {
      network_id: "*",
      port: 7545,
      host: "127.0.0.1"
    }
  },
  mocha: {},
  compilers: {
    solc: {
      version: "0.8.11"
    }
  }
};
