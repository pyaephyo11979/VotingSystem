const base_url = "http://localhost:8080/api/events";

export const createEvent = async (eventName: string) => {
  try {
    const response = await fetch(`${base_url}/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ eventName }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create event");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
};

export const addCandidates = async (eventId: string, name: string, photo: File) => {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("photo", photo);

  try {
    const response = await fetch(`${base_url}/${eventId}/candidates`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to add candidates");
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding candidates:", error);
    throw error;
  }
};

export const getCandidates = async (eventId: string, password?: string) => {
  try {
    let url = `${base_url}/${eventId}/candidates`;
    if (password) {
      url += `?password=${password}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching candidates:", error);
    throw error;
  }
};

export const createAccounts = async (eventId: string, eventSize: number) => {
  try {
    const response = await fetch(`${base_url}/${eventId}/accounts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventSize }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Failed to create accounts");
    }
    return await response.json();
  } catch (error) {
    console.error("Error creating accounts:", error);
    throw error;
  }
};

export const getAccounts = async (eventId: string) => {
  try {
    const response = await fetch(`${base_url}/${eventId}/accounts`);
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Failed to fetch accounts");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching accounts:", error);
    throw error;
  }
};

export const getResults = async (eventId: string) => {
  try {
    const response = await fetch(`${base_url}/${eventId}/results`);
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Failed to fetch results");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching results:", error);
    throw error;
  }
};

export const getVoteStatus = async (eventId: string, userId: string) => {
  try {
    const response = await fetch(`${base_url}/${eventId}/vote-status/${userId}`);
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Failed to fetch vote status");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching vote status:", error);
    throw error;
  }
};

// VOTER ACTIONS
export const loginUser = async (username: string, password: string) => {
  try {
    const response = await fetch(`${base_url}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Login failed");
    }
    return await response.json();
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

export const getVoterCandidates = async (eventId: string, password: string) => {
  return getCandidates(eventId, password);
};

export const castVote = async (eventId: string, userId: string, candidateId: string) => {
  try {
    const response = await fetch(`${base_url}/${eventId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ candidateId, userId }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Failed to cast vote");
    }
    return await response.json();
  } catch (error) {
    console.error("Error casting vote:", error);
    throw error;
  }
};
