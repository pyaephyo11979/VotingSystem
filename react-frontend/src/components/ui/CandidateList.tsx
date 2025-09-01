import { useState } from 'react';
import { updateCandidate, deleteCandidate } from '@/utils/api';

interface CandidateLike { id?: string; candidateId?: string; name?: string; candidateName?: string; photo?: string | null | undefined; image?: string }
interface Props { candidates: CandidateLike[]; onUpdated?: (id:string, partial:Partial<CandidateLike>)=>void; onDeleted?: (id:string)=>void }

const CandidateList = ({ candidates, onUpdated, onDeleted }: Props) => {
  const [busyId, setBusyId] = useState<string|null>(null);

  const handleUpdate = async (id:string) => {
    const newName = prompt('Enter new candidate name (leave blank to keep current):');
    if (newName === null) return; // cancelled
    try {
      setBusyId(id);
      await updateCandidate(localStorage.getItem('eventId')||'', id, newName || undefined);
      onUpdated?.(id, { name: newName || undefined });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Update failed';
      alert(msg);
    } finally { setBusyId(null); }
  };

  const handleDelete = async (id:string) => {
    if (!confirm('Delete this candidate? This cannot be undone.')) return;
    try {
      setBusyId(id);
      await deleteCandidate(localStorage.getItem('eventId')||'', id);
      onDeleted?.(id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Delete failed';
      alert(msg);
    } finally { setBusyId(null); }
  };
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
              <span className='text-black flex-1'>{name}</span>
              <div className='flex gap-2'>
                <button disabled={busyId===id} onClick={()=>handleUpdate(id)} className='px-2 py-1 text-xs rounded bg-blue-500 text-white disabled:opacity-50'>Edit</button>
                <button disabled={busyId===id} onClick={()=>handleDelete(id)} className='px-2 py-1 text-xs rounded bg-red-500 text-white disabled:opacity-50'>Del</button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CandidateList;
