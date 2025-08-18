const base_url = "http://localhost:8080/api/events";
const createEvent = async (eventName: string) => {
  try {
    const response = await fetch(`${base_url}/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ eventName: eventName }),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    res.status(201).json(data);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Failed to create event" });
  }
};
const addCandidates = async (eventId: string,name: string,photo: any) => {
  try {
    const response = await fetch(
      `${base_url}/${eventId}/candidates`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: name,
            eventId:eventId,
            photo: photo,
        }),
      },
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    res.status(201).json(data);
  } catch (error) {
    console.error("Error adding candidates:", error);
    res.status(500).json({ error: "Failed to add candidates" });
  }
};
const getCandidates = async (eventId: string) => {
  try {
    const response = await fetch(`${base_url}/${eventId}/candidates`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching candidates:", error);
    throw error;
  }
};

module.exports = {
  createEvent,
  addCandidates,
  getCandidates,
};
