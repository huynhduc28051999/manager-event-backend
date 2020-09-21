export interface ByUser {
  _id: string
  name: string
}
export interface AddUserDTO {
  name: string
  password: string
  email: string
  gender: Gender
  phoneNumber: string
  avatar: string
  birthday: number
  idGroup: string
  role: string
}
export interface LoginDTO {
  email: string
  password: string
}
export interface UpdateUserDTO {
  name: string
  password: string
  phoneNumber: string
  idGroup: string
  avatar: string
  birthday: string
  role: string
  gender: Gender
}
export interface AddEventDTO {
  name: string
  idGroup: string
  users: UserEvent[]
  description: string
}
export enum EventState {
  COMPLETED = 'COMPLETED',
  PROCESSING = 'PROCESSING',
  CANCELLED = 'CANCELLED'
}
export interface GroupDTO {
  name: string
  avatar: string
  description: string
}
export interface FeedbackDTO {
  idEvent: string
	content: string
}

export enum UserEventState {
  APPROVED = 'APPROVED',
  REQUESTED = 'REQUESTED',
  CANCELLED = 'CANCELLED'
}
export interface UserEvent {
  idUser: string
  state: UserEventState
}
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  ORTHER = 'ORTHER'
}
export enum VoteType {
  LIKE = 'LIKE',
  DISLIKE = 'DISLIKE',
  NONE = 'NONE'
}
export interface ChangePasswordDTO {
  currentPassword: string,
  newPassword: string
}
export interface ChangeProfile {
  name: string
  phoneNumber: string
  avatar: string
  birthday: string
  gender: Gender
}