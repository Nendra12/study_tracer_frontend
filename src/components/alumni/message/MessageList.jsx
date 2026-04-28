import React, { useMemo } from 'react';
import DaySeparator from './DaySeparator';
import ScrollToBottomButton from './ScrollToBottomButton';
import MessageBubble from './MessageBubble';
import { getDayLabel, getMessageDate, toDateKey } from './dateUtils';

export default function MessageList({
  messagingLoadingMessages,
  activeChat,
  currentUserId,
  currentMessages,
  highlightedMessageId,
  isMessageSelectionMode,
  selectedMessageIds,
  setSelectedMessageIds,
  activeMessageMenuId,
  setActiveMessageMenuId,
  onReply,
  onDeleteMessage,
  onPreviewImage,
  scrollToMessage,
  handleScrollMessages,
  messagesEndRef,
  showScrollButton,
  scrollToBottom,
  getImageUrl,
  formatClockTime,
  renderMessageStatus,
}) {
  const visibleMessages = useMemo(
    () => (currentMessages || []).filter((m) => !m?.is_deleted),
    [currentMessages]
  );

  return (
    <div
      className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-5 bg-white relative custom-scrollbar"
      onScroll={handleScrollMessages}
    >
      {messagingLoadingMessages ? (
        <div className="flex-1 flex flex-col gap-4 py-4 w-full">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`flex w-full gap-2 ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
              <div className={`w-2/3 md:w-1/2 h-16 rounded-2xl bg-gray-200 animate-pulse ${i % 2 === 0 ? 'rounded-br-sm' : 'rounded-bl-sm'}`}></div>
            </div>
          ))}
        </div>
      ) : visibleMessages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Kirim pesan untuk memulai obrolan</div>
      ) : (
        <>
          <DaySeparator label={getDayLabel(getMessageDate(visibleMessages[0]))} />
          {visibleMessages.map((msg, index) => {
            const isMe = msg.sender?.id_users === currentUserId;
            const isHighlighted = highlightedMessageId === msg.id_message;
            const isSelected = selectedMessageIds.includes(msg.id_message);
            const isGroupMessage = activeChat?.type === 'group' && !isMe;
            const senderName = msg.sender?.nama_alumni || msg.sender?.name || 'User';

            const msgDate = getMessageDate(msg);
            const msgKey = toDateKey(msgDate);
            const prevDate = index > 0 ? getMessageDate(visibleMessages[index - 1]) : null;
            const prevKey = toDateKey(prevDate);
            const showSeparator = index > 0 && msgKey && prevKey && msgKey !== prevKey;

            return (
              <React.Fragment key={msg.id_message}>
                {showSeparator && <DaySeparator label={getDayLabel(msgDate)} />}
                <MessageBubble
                  msg={msg}
                  isMe={isMe}
                  isGroupMessage={isGroupMessage}
                  senderName={senderName}
                  isHighlighted={isHighlighted}
                  isMessageSelectionMode={isMessageSelectionMode}
                  isSelected={isSelected}
                  onToggleSelect={(id) => {
                    if (isSelected) {
                      setSelectedMessageIds(selectedMessageIds.filter((x) => x !== id));
                    } else {
                      setSelectedMessageIds([...selectedMessageIds, id]);
                    }
                  }}
                  activeMessageMenuId={activeMessageMenuId}
                  setActiveMessageMenuId={setActiveMessageMenuId}
                  onReply={onReply}
                  onDelete={onDeleteMessage}
                  onScrollToMessage={scrollToMessage}
                  onPreviewImage={onPreviewImage}
                  getImageUrl={getImageUrl}
                  formatClockTime={formatClockTime}
                  renderMessageStatus={renderMessageStatus}
                />
              </React.Fragment>
            );
          })}
        </>
      )}

      <div ref={messagesEndRef} />

      {showScrollButton && <ScrollToBottomButton onClick={scrollToBottom} />}
    </div>
  );
}
