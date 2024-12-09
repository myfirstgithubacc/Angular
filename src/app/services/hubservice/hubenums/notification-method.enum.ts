// eslint-disable-next-line no-shadow
export enum NotificationMethods {
    SendToAll = 'SendToAll',
    SendToAllIncludingSender = 'SendToAllIncludingSender',
    SendToAllInGroup = 'SendToAllInGroup',
    SendToAllInGroupIncludingSender = 'SendToAllInGroupIncludingSender',
    SendToSpecificUsers = 'SendToSpecificUsers',
    SendBellNotification = 'SendBellNotification',
    SendRefreshSignal = 'SendRefreshSignal',
    SendRefreshSignalToAll = 'SendRefreshSignalToAll',
    JWTTokenRevoked = 'JWTTokenRevoked'
}
