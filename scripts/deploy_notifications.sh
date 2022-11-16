#!/bin/bash
mv docker/notifications/fly.toml .
fly deploy --env VAPID_PUBLIC_KEY=$VAPID_PUBLIC_KEY --env VAPID_PRIVATE_KEY=$VAPID_PRIVATE_KEY
