type eventName = string;
type eventId = string;
type password = string;
type message = string;
type totalAccounts = number;
type totalVotes = number;
type accountsCreated = number;
type candidateId = string;
type candidateName = string;
type res = Promise<object>;
type candidateVotes = number;
type candidate = {
  id: candidateId;
  name: candidateName;
  photo?: string;
};
type event = {
  eventId: eventId;
  eventName: eventName;
  eventPassword: string;
};
type user = {
  userId: string;
  username: string;
  password: string;
  eventId: eventId;
};
type candidates = candidate[];

export type {
  eventName,
  eventId,
  password,
  message,
  totalAccounts,
  totalVotes,
  accountsCreated,
  candidateId,
  candidateName,
  res,
  candidateVotes,
  candidate,
  event,
  user,
  candidates,
};
