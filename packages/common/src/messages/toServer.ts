export type SubscriptionType = "collection" | "individual";
export type SubscriptionMessage = {
    type: SubscriptionType,
    room: string;
}

export type SendChat = {
    type: "group" | "individual",
    room: string;
    message: string;
}
