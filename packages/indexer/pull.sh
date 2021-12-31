#!/bin/bash

CMD="cd challenge-X-transaction-script && git pull"

ssh beast1 "$CMD"
ssh beast2 "$CMD"
ssh beast3 "$CMD"
ssh beast4 "$CMD"
ssh beast12 "$CMD"
