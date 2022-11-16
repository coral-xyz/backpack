#!/bin/bash
mv docker/notifications/fly.toml .
fly deploy
#--env VAPID_PUBLIC_KEY=$VAPID_PUBLIC_KEY --env VAPID_PRIVATE_KEY=$VAPID_PRIVATE_KEY --env AUTH_JWT=$AUTH_JWT --env HASURA_URL=$HASURA_URL