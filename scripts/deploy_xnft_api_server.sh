#!/bin/bash
rm fly.toml
mv docker/xnft-api-server/fly.toml .
fly deploy
