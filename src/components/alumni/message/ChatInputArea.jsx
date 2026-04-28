import React, { useRef, useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { ImagePlus, Plus, SendHorizontal, Smile } from 'lucide-react';
import { toastWarning } from '../../../utilitis/alert';
import TenorPicker from './TenorPicker';
import ReplyingToBanner from './ReplyingToBanner';
import AttachmentPreviewBox from './AttachmentPreviewBox';

export default function ChatInputArea({
  messaging,
  activeChat,
  currentUserId,
  replyingToMessage,
  setReplyingToMessage,
}) {
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState(null);

  const imageInputRef = useRef(null);

  const handleSendMessage = async () => {
    if (!messageInput.trim() && !attachmentPreview) {
      toastWarning('Tulis pesan atau pilih lampiran dulu.');
      return;
    }

    const convId = activeChat?.id_conversation;
    if (!convId) {
      toastWarning('Pilih chat dulu untuk mengirim pesan.');
      return;
    }

    let data;
    if (attachmentPreview?.file) {
      data = new FormData();
      data.append('type', attachmentPreview.type);
      data.append('file', attachmentPreview.file);
      if (messageInput.trim()) data.append('body', messageInput.trim());
      if (replyingToMessage) data.append('reply_to_id', replyingToMessage.id_message);
    } else if (attachmentPreview?.type === 'gif') {
      data = { type: 'gif', gif_url: attachmentPreview.url, body: messageInput.trim() || undefined };
      if (replyingToMessage) data.reply_to_id = replyingToMessage.id_message;
    } else {
      data = { type: 'text', body: messageInput.trim() };
      if (replyingToMessage) data.reply_to_id = replyingToMessage.id_message;
    }

    setMessageInput('');
    setAttachmentPreview(null);
    setShowEmojiPicker(false);
    setReplyingToMessage?.(null);

    try {
      await messaging.sendMessage(convId, data);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleSendAttachment = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'image' && !file.type.startsWith('image/')) {
      toastWarning('Hanya file gambar yang diperbolehkan.');
      e.target.value = null;
      return;
    }

    setShowEmojiPicker(false);
    setShowGifPicker(false);
    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachmentPreview({ type, fileName: file.name, url: event.target.result, file });
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const handleSendGif = (url) => {
    const convId = activeChat?.id_conversation;
    if (!convId) return;
    messaging.sendMessage(convId, { type: 'gif', gif_url: url }).catch(() => { });
    setShowGifPicker(false);
  };

  const onEmojiClick = (emojiObject) => {
    setMessageInput((prev) => prev + emojiObject.emoji);
  };

  return (
    <div className="p-4 md:p-5 bg-white border-t border-gray-100 shrink-0 relative">
      <input type="file" accept="image/*" ref={imageInputRef} className="hidden" onChange={(e) => handleSendAttachment(e, 'image')} />

      {showEmojiPicker && (
        <div className="absolute bottom-[calc(100%+10px)] right-4 md:right-10 z-50 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          <EmojiPicker onEmojiClick={onEmojiClick} searchDisabled />
        </div>
      )}

      {showGifPicker && <TenorPicker onSelectGif={handleSendGif} onClose={() => setShowGifPicker(false)} />}

      <ReplyingToBanner
        replyingToMessage={replyingToMessage}
        currentUserId={currentUserId}
        onCancel={() => setReplyingToMessage?.(null)}
      />

      <AttachmentPreviewBox attachmentPreview={attachmentPreview} onCancel={() => setAttachmentPreview(null)} />

      <div className="flex items-center max-w-4xl gap-1 mx-auto relative">
        {/* Mobile Plus */}
        <div className="relative md:hidden shrink-0">
          <button
            onClick={() => setShowAttachments(!showAttachments)}
            className={`p-2 cursor-pointer rounded-full transition-colors ${showAttachments ? 'bg-primary text-white' : 'text-gray-400 hover:bg-[#f8f9fa] hover:text-primary'}`}
          >
            <Plus size={20} className={showAttachments ? 'rotate-45 transition-transform' : 'transition-transform'} />
          </button>

          {showAttachments && (
            <div className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 flex flex-col gap-2 z-50 animate-in fade-in zoom-in-95">
              <button
                onClick={() => {
                  imageInputRef.current?.click();
                  setShowAttachments(false);
                }}
                className="p-3 cursor-pointer rounded-xl bg-gray-50 text-gray-600 hover:bg-primary/10 hover:text-primary transition-colors flex justify-center"
                title="Kirim Gambar"
              >
                <ImagePlus size={20} />
              </button>

              <button
                onClick={() => {
                  setShowGifPicker(!showGifPicker);
                  setShowEmojiPicker(false);
                  setShowAttachments(false);
                }}
                className={`p-3 cursor-pointer rounded-xl transition-colors font-bold text-sm flex justify-center ${showGifPicker ? 'text-primary bg-primary/10' : 'bg-gray-50 text-gray-600 hover:bg-primary/10 hover:text-primary'}`}
                title="Kirim GIF"
              >
                GIF
              </button>
            </div>
          )}
        </div>

        {/* Desktop icons */}
        <div className="hidden md:flex items-center gap-1 shrink-0">
          <button
            onClick={() => imageInputRef.current?.click()}
            className="p-2 cursor-pointer rounded-full text-gray-400 hover:bg-[#f8f9fa] hover:text-primary transition-colors shrink-0"
            title="Kirim Gambar"
          >
            <ImagePlus size={20} />
          </button>

          <button
            onClick={() => {
              setShowGifPicker(!showGifPicker);
              setShowEmojiPicker(false);
            }}
            className={`p-2 cursor-pointer rounded-full transition-colors shrink-0 font-bold text-sm ${showGifPicker ? 'text-primary bg-primary/10' : 'text-gray-400 hover:bg-[#f8f9fa] hover:text-primary'}`}
            title="Kirim GIF"
          >
            GIF
          </button>
        </div>

        <button
          onClick={() => {
            setShowEmojiPicker(!showEmojiPicker);
            setShowGifPicker(false);
            setShowAttachments(false);
          }}
          className={`p-2 cursor-pointer rounded-full transition-colors shrink-0 ${showEmojiPicker ? 'text-primary bg-primary/10' : 'text-gray-400 hover:bg-[#f8f9fa] hover:text-primary'}`}
          title="Kirim Emoji"
        >
          <Smile size={20} />
        </button>

        <div className="flex-1 bg-[#f8f9fa] rounded-full border border-transparent focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10 transition-all flex items-center pr-2 ml-1">
          <input
            type="text"
            placeholder={attachmentPreview ? 'Tambahkan caption...' : 'Tulis pesan...'}
            className="w-full bg-transparent text-sm py-3 px-4 focus:outline-none text-primary"
            value={messageInput}
            onChange={(e) => {
              setMessageInput(e.target.value);
              if (activeChat?.id_conversation) messaging.handleTypingInput(activeChat.id_conversation);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />

          <button
            className={`p-2 cursor-pointer rounded-full transition-all shrink-0 ${messageInput.trim() || attachmentPreview
              ? 'bg-primary text-white hover:bg-primary/90 shadow-md'
              : 'bg-gray-200 text-gray-400'
              }`}
            onClick={handleSendMessage}
            disabled={!messageInput.trim() && !attachmentPreview}
          >
            <SendHorizontal size={16} className={messageInput.trim() || attachmentPreview ? 'ml-0.5' : ''} />
          </button>
        </div>
      </div>
    </div>
  );
}
