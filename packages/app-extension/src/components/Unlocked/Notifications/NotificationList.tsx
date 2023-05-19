import { useEffect, useMemo } from "react";
import { useSuspenseQuery_experimental } from "@apollo/client";
import { BACKEND_API_URL, XNFT_GG_LINK } from "@coral-xyz/common";
import { BubbleTopLabel, EmptyState } from "@coral-xyz/react-common";
import { unreadCount } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import NotificationsIcon from "@mui/icons-material/Notifications";
import List from "@mui/material/List";
import { useRecoilState } from "recoil";

import { gql } from "../../../graphql";
import { SortDirection } from "../../../graphql/graphql";

import { NotificationListItem } from "./NotificationListItem";
import { getGroupedNotifications } from "./utils";

const GET_NOTIFICATIONS = gql(`
  query GetNotifications($filters: NotificationFiltersInput) {
    user {
      id
      notifications(filters: $filters) {
        edges {
          node {
            id
            body
            source
            timestamp
            title
            viewed
          }
        }
      }
    }
  }
`);

export function NotificationList({
  onOpenDrawer,
}: {
  onOpenDrawer?: () => void;
}) {
  const theme = useCustomTheme();
  const [, setUnreadCount] = useRecoilState(unreadCount);

  const { data } = useSuspenseQuery_experimental(GET_NOTIFICATIONS, {
    variables: {
      filters: {
        limit: 50,
        sortDirection: SortDirection.Desc,
      },
    },
  });

  const notifications = useMemo(
    () => data.user?.notifications?.edges.map((e) => e.node) ?? [],
    [data.user]
  );

  const groupedNotifications = useMemo(
    () => getGroupedNotifications(notifications),
    [notifications]
  );

  useEffect(() => {
    const latestNotification = notifications.slice()[0];

    if (latestNotification && latestNotification.id) {
      fetch(`${BACKEND_API_URL}/notifications/cursor`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lastNotificationId: latestNotification.id,
        }),
      }).catch(console.error);
    }

    fetch(`${BACKEND_API_URL}/notifications/seen`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        notificationIds: notifications
          .filter((x) => !x.viewed)
          .map(({ id }) => id),
      }),
    }).catch(console.error);

    setUnreadCount(0);
  }, [notifications, setUnreadCount]);

  return groupedNotifications.length > 0 ? (
    <div
      style={{
        paddingBottom: "16px",
      }}
    >
      {groupedNotifications.map(({ date, notifications }) => (
        <div
          key={date}
          style={{
            marginLeft: "16px",
            marginRight: "16px",
            marginTop: "16px",
          }}
        >
          <BubbleTopLabel text={date} />
          <List
            style={{
              paddingTop: 0,
              paddingBottom: 0,
              borderRadius: "12px",
              border: `${theme.custom.colors.borderFull}`,
            }}
          >
            {notifications.map((notification, idx) => (
              <NotificationListItem
                key={notification.id}
                notification={notification}
                isFirst={idx === 0}
                isLast={idx === notifications.length - 1}
                onOpenDrawer={onOpenDrawer}
              />
            ))}
          </List>
        </div>
      ))}
    </div>
  ) : (
    <NoNotificationsLabel minimize={false} />
  );
}

function NoNotificationsLabel({ minimize }: { minimize: boolean }) {
  const theme = useCustomTheme();
  return (
    <div
      style={{
        height: "100%",
        display: minimize ? "none" : undefined,
      }}
    >
      <EmptyState
        icon={(props: any) => <NotificationsIcon {...props} />}
        title="No Notifications"
        subtitle={"You don't have any notifications yet."}
        buttonText="Browse the xNFT Library"
        onClick={() => window.open(XNFT_GG_LINK)}
        innerStyle={{
          marginBottom: minimize !== true ? "64px" : 0, // Tab height offset.
        }}
        contentStyle={{
          color: minimize ? theme.custom.colors.secondary : "inherit",
        }}
        minimize={minimize}
      />
    </div>
  );
}
