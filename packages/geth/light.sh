#!/bin/bash

# Install Geth!
# https://geth.ethereum.org/downloads/

# Run a "light" client and allow http access...
geth --datadir "./light-data" --syncmode "light" --cache=4096 --maxpeers=50 --http --http.addr "0.0.0.0" --http.corsdomain "*" --http.api="eth,net,personal,web3,txpool" --http.port=48545
