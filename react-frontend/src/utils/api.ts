const base_url='http://localhost:8080/api/events';
const createEvent = async(eventName:String)=>{
    try{
        const response = await fetch(`${base_url}/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({ "eventName": eventName }),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        res.status(201).json(data);
    }catch(error){
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
}
const addCandidates= async(req:any,res:any)=>{
    try{
        const response = await fetch(`${base_url}/${req.params.eventId}/candidates`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        res.status(201).json(data);
    }catch(error){
        console.error('Error adding candidates:', error);
        res.status(500).json({ error: 'Failed to add candidates' });
    }}
}