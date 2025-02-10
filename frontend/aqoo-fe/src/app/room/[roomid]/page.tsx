'use client';

import { useSearchParams } from 'next/navigation';
import IntegratedRoom from './components/integratedroom';

interface RoomPageProps {
  params: { roomid: string }; // 폴더명이 [roomid]이면 여기서는 "roomid"로 추출해야 함
}

export default function RoomPage({ params }: RoomPageProps) {
  const { roomid } = params; // roomid를 추출
  console.log('Extracted roomid from URL:', roomid); // roomid 콘솔 로그 추가

  const searchParams = useSearchParams();
  const userName = searchParams.get('userName') || '';
  // 방장 여부는 쿼리 파라미터 isHost로 결정 (방 생성 시 CreateChatRoom 페이지에서 true로 설정됨)
  const isHost = searchParams.get('isHost') === 'true';

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <IntegratedRoom roomId={roomid} userName={userName} />
    </div>
  );
}
