import { useState } from 'react';
import { updateCandidate, deleteCandidate } from '@/utils/api';
import {useTranslation} from "react-i18next";

interface CandidateLike { id?: string; candidateId?: string; name?: string; candidateName?: string; photo?: string | null | undefined; image?: string }
interface Props { eventId: string; candidates: CandidateLike[]; onUpdated?: (id:string, partial:Partial<CandidateLike>)=>void; onDeleted?: (id:string)=>void }

const CandidateList = ({ eventId, candidates, onUpdated, onDeleted }: Props) => {
  const [busyId, setBusyId] = useState<string|null>(null);
  const {t} = useTranslation();

  const handleUpdate = async (id:string|undefined) => {
    if (!id) { alert(t('candidate_id_missing') || 'Candidate ID missing'); return; }
    const newName = prompt(t('update_candidate_name'));
    if (newName === null) return; // cancelled
    try {
      setBusyId(id);
      await updateCandidate(eventId, id, newName || undefined);
      onUpdated?.(id, { name: newName || undefined });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Update failed';
      alert(msg);
    } finally { setBusyId(null); }
  };

  const handleDelete = async (id:string|undefined) => {
    if (!id) { alert(t('candidate_id_missing') || 'Candidate ID missing'); return; }
    if (!confirm(t('wanna_delete_candidate'))) return;
    try {
      setBusyId(id);
      await deleteCandidate(eventId, id);
      onDeleted?.(id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Delete failed';
      alert(msg);
    } finally { setBusyId(null); }
  };
  return (
    <div className="w-full max-w-md p-4 border rounded-md">
      <h2 className="text-xl font-bold mb-4">{t('candidates')}</h2>
      <ul className="space-y-2">
        {candidates.map((c, idx) => {
          const id = c.id || c.candidateId; // only accept real IDs
          const name = c.name || c.candidateName || `#${idx+1}`;
          const photo = c.photo || c.image;
          const disabled = !id || busyId===id;
          return (
            <li key={id ?? `row-${idx}`} className="flex items-center space-x-4 p-2 border rounded-md">
              {photo ? (
                <img src={photo} alt={name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className='text-black flex-1'>{name}</span>
              <div className='flex gap-2'>
                <button disabled={disabled} onClick={()=>handleUpdate(id)} className='px-2 py-1 text-xs rounded bg-blue-500 text-white disabled:opacity-50'>{t('edit')}</button>
                <button disabled={disabled} onClick={()=>handleDelete(id)} className='px-2 py-1 text-xs rounded bg-red-500 text-white disabled:opacity-50'>{t('delete')}</button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CandidateList;
