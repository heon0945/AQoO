"use client";

export default function FriendsList({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed left-20 bottom-40 w-80 h-3/5 bg-white/40 shadow-lg p-4 transition-all">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">친구 3</h2>
        <button onClick={onClose} className="text-xl font-bold hover:text-red-500">
          ✖
        </button>
      </div>

      <div className="space-y-3">
        {[1, 2, 3].map((index) => (
          <div key={index} className="p-3 bg-gray-100 rounded-lg flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            <div>
              <p className="font-bold">닉네임 {index}</p>
              <p className="text-sm text-gray-500">상태 메시지</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <input type="text" placeholder="친구를 검색하세요" className="w-full p-2 border rounded-md" />
        <button className="w-full mt-2 p-2 bg-blue-500 text-white rounded-md">검색</button>
      </div>
    </div>
  );
}
