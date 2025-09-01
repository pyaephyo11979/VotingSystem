interface CandidateLike { id?: string; candidateId?: string; name?: string; candidateName?: string; photo?: string | null | undefined; image?: string }
const CandidateList = ({ candidates }: { candidates: CandidateLike[] }) => {
  return (
    <div className="w-full max-w-md p-4 border rounded-md">
      <h2 className="text-xl font-bold mb-4">Candidates</h2>
      <ul className="space-y-2">
        {candidates.map((c, idx) => {
          const id = c.id || c.candidateId || c.name || c.candidateName || String(idx);
          const name = c.name || c.candidateName || id;
          const photo = c.photo || c.image;
          return (
            <li key={id} className="flex items-center space-x-4 p-2 border rounded-md">
              {photo ? (
                <img src={photo} alt={name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className='text-black'>{name}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CandidateList;
