interface MessageBubbleProps {
  content: string;
  type: 'sender' | 'receiver';
}

export function MessageBubble({ content, type }: MessageBubbleProps) {
  return (
    <div className={`flex ${type === 'sender' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`rounded-2xl px-4 py-2 max-w-[80%] ${
          type === 'sender'
            ? 'bg-blue-500 text-white rounded-br-sm'
            : 'bg-gray-200 text-gray-900 rounded-bl-sm'
        }`}
      >
        <p className="text-sm">{content}</p>
      </div>
    </div>
  )
} 