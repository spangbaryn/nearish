export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-gray-200 rounded-2xl px-4 py-2">
        <div className="flex space-x-1">
          {[1, 2, 3].map((dot) => (
            <div
              key={dot}
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{
                animationDelay: `${dot * 0.2}s`,
                animationDuration: '0.8s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
} 