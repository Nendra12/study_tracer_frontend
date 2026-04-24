import React, { useMemo, useState } from 'react';
import { X, Users, Save, Loader2, ImagePlus } from 'lucide-react';
import { getAvatarUrl, getDisplayName, getImageUrl } from '../../hooks/useMessaging';

function getParticipantInfo(participant) {
  const user = participant?.user || participant?.alumni || participant;
  return {
    id: user?.id_users || user?.id_alumni || user?.id,
    name: user?.nama_alumni || user?.name || 'User',
    avatar: getImageUrl(user?.foto),
    jurusan: user?.jurusan,
    tahun_lulus: user?.tahun_lulus,
  };
}

export default function GroupInfoModal({ isOpen, onClose, conversation, onSubmit, saving }) {
  const [groupName, setGroupName] = useState(conversation?.group_name || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(conversation?.group_avatar ? getImageUrl(conversation.group_avatar) : '');

  const participants = useMemo(() => {
    return (conversation?.participants || []).map(getParticipantInfo);
  }, [conversation]);

  React.useEffect(() => {
    setGroupName(conversation?.group_name || '');
    setAvatarFile(null);
    setAvatarPreview(conversation?.group_avatar ? getImageUrl(conversation.group_avatar) : '');
  }, [conversation]);

  if (!isOpen || !conversation) return null;

  const fallbackAvatar = getAvatarUrl(conversation);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarPreview(event.target?.result || '');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    await onSubmit?.({
      group_name: groupName.trim(),
      group_avatar: avatarFile || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Info Grup</h3>
            <p className="text-xs text-gray-500">Kelola nama dan avatar grup</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-4">
            <label className="relative cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              {avatarPreview || fallbackAvatar ? (
                <img
                  src={avatarPreview || fallbackAvatar}
                  alt={getDisplayName(conversation)}
                  className="w-16 h-16 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                  <ImagePlus size={22} />
                </div>
              )}
            </label>
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Grup</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="mt-1 w-full bg-gray-50 border border-gray-200 text-sm rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} className="text-primary" />
              <h4 className="text-sm font-bold text-gray-700">Anggota ({participants.length})</h4>
            </div>
            <div className="space-y-2">
              {participants.length === 0 ? (
                <p className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-xl p-3">Data anggota belum tersedia.</p>
              ) : participants.map((member) => {
                const avatar = member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=e0e7ff&color=4f46e5`;
                return (
                  <div key={member.id || member.name} className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 bg-white">
                    <img src={avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{member.name}</p>
                      <p className="text-xs text-gray-500">{[member.jurusan, member.tahun_lulus].filter(Boolean).join(' · ') || 'Alumni'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Tutup
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !groupName.trim()}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors ${saving || !groupName.trim() ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/90 cursor-pointer'}`}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}
