#!/bin/bash

CMD="cd challenge-X-transaction-script/packages/indexer && node blocknumber && node lister"

ssh beast1 "$CMD"
ssh beast2 "$CMD"
ssh beast3 "$CMD"
ssh beast4 "$CMD"
ssh beast5 "$CMD"
ssh beast6 "$CMD"
ssh beast7 "$CMD"
ssh beast8 "$CMD"
ssh beast9 "$CMD"
ssh beast10 "$CMD"
ssh beast11 "$CMD"
ssh beast12 "$CMD"
