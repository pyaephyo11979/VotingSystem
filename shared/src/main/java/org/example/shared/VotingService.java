package org.example.shared;

import java.rmi.Remote;
import java.rmi.RemoteException;
import java.util.List;
import java.util.Map;

public interface VotingService extends Remote {
    // Admin methods
    EventInfo createEvent(String eventName) throws RemoteException;

    // Returns the created candidate's ID (DB generated)
    String addCandidate(String eventId, String candidateName, byte[] photo) throws RemoteException;

    // Update candidate (name and/or photo). If newName is null/blank keep existing. If photo null keep existing.
    boolean updateCandidate(String eventId, String candidateId, String newName, byte[] newPhoto) throws RemoteException;

    // Delete candidate by id within event
    boolean deleteCandidate(String eventId, String candidateId) throws RemoteException;

    Map<String, Integer> getResults(String eventId) throws RemoteException;

    List<Map<String, String>> createAccounts(String eventId, int eventSize) throws RemoteException;

    List<Map<String, String>> getUserAccounts(String eventID) throws RemoteException;

    // Voter methods
    Map<String, String> Login(String username, String password) throws RemoteException;

    List<Candidate> getEventForVoter(String eventId, String password) throws RemoteException;

    boolean castVote(String userId, String eventId, String candidateId) throws RemoteException;

    boolean hasUserVoted(String userId, String eventId) throws RemoteException;
}
