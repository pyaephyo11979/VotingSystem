type eventName = string;
type eventId = string;
type message = string;
type totalAccounts = number;
type totalVotes = number;
type accountsCreated = number;
type candidateId = string;
type candidateName = string;
type res=Promise<object>;
type candidateVotes = number;
type candidate = {
    id: candidateId;
    name: candidateName;
    photoUrl?: string; // Optional field for candidate photo URL
    votes: candidateVotes;
};
type event = {
    eventId: eventId;
    eventName: eventName;
    eventPassword: string;
};
type user={
    userId: string;
    username: string;
    password: string;
    eventId: eventId;
}