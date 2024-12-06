export enum EventTypes {
  RECEIVE_MESSAGE = 'RECEIVE_MESSAGE',
  RECEIVE_GROUP_MESSAGE = 'RECEIVE_GROUP_MESSAGE',
  UPDATED_ONLINE_USERS = 'UPDATED_ONLINE_USERS',
  NEW_GROUP_INVITATION = 'NEW_GROUP_INVITATION',
  SEND_MESSAGE = 'SEND_MESSAGE',
  JOIN_GROUP = 'JOIN_GROUP',
  SEND_GROUP_MESSAGE = 'SEND_GROUP_MESSAGE',
  USER_TYPING = 'USER_TYPING',
  IS_USER_TYPING = 'IS_USER_TYPING',
}

export enum MessageType {
  TEXT = 'TEXT',
  MEDIA = 'MEDIA',
}

export enum ChatTypeEnum {
  USER = 'user',
  GROUP = 'group',
}
