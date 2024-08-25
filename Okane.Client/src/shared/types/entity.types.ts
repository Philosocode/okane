// An entity will be missing an ID before it's been created on the API.
export type PreCreationEntity<T> = Omit<T, 'id'>
