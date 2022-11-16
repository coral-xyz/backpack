#!/bin/bash
rm fly.toml
mv docker/notifications/fly.toml .
fly deploy
