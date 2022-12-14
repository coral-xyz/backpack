import { Chain } from "@coral-xyz/zeus";

import { HASURA_URL, JWT } from "../config";

const chain = Chain(HASURA_URL, {
  headers: {
    Authorization: `Bearer ${JWT}`,
  },
});

interface Preference {
  notifications: boolean;
  media: boolean;
}

export const insertSubscription = (
  publicKey: string,
  uuid: string,
  subscription: any
) => {
  return chain("mutation")({
    insert_auth_notification_subscriptions_one: [
      {
        object: {
          public_key: publicKey,
          uuid,
          username: "",
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          expirationTime: subscription.expirationTime || "",
        },
      },
      {
        id: true,
      },
    ],
  });
};

export const getPreferences = async (uuid: string) => {
  const currentPreferences = await chain("query")({
    auth_xnft_preferences: [
      {
        where: { uuid: { _eq: uuid } },
      },
      {
        id: true,
        xnft_id: true,
        notifications: true,
        media: true,
      },
    ],
  });

  return currentPreferences.auth_xnft_preferences.map((x) => ({
    notifications: x.notifications,
    media: x.media,
    xnftId: x.xnft_id,
  }));
};

export const updatePreference = async (
  xnftId: string,
  uuid: string,
  preferences: Preference
) => {
  //TODO: Fix possible race condition (two creates at same time)
  const currentPreference = await chain("query")({
    auth_xnft_preferences: [
      {
        where: { xnft_id: { _eq: xnftId }, uuid: { _eq: uuid } },
        limit: 1,
      },
      {
        id: true,
      },
    ],
  });

  const preference = currentPreference.auth_xnft_preferences?.[0];
  if (preference) {
    await chain("mutation")({
      update_auth_xnft_preferences: [
        {
          _set: {
            notifications: preferences.notifications || false,
            media: preferences.media || false,
          },
          where: { id: { _eq: preference.id } },
        },
        { affected_rows: true },
      ],
    });
  } else {
    await chain("mutation")({
      insert_auth_xnft_preferences_one: [
        {
          object: {
            uuid,
            xnft_id: xnftId,
            username: "",
            notifications: preferences.notifications || false,
            media: preferences.media || false,
          },
        },
        {
          id: true,
        },
      ],
    });
  }
};
