#!/bin/bash
rm fly.toml
mv docker/backpack_api/fly.toml .
fly deploy
