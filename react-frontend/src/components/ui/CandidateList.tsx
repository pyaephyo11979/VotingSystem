const CandidateList = ({ candidates }) => {
  return (
    <div className="w-full max-w-md p-4 border rounded-md">
      <h2 className="text-xl font-bold mb-4">Candidates</h2>
      <ul className="space-y-2">
        {candidates.map((candidate) => (
          <li key={candidate.id} className="flex items-center space-x-4 p-2 border rounded-md">
            <img src={candidate.photo} alt={candidate.name} className="w-12 h-12 rounded-full" />
            <span className='text-black'>{candidate.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CandidateList;
