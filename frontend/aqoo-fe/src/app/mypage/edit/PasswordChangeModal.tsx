import Modal from "./Modal";

interface PasswordChangeModalProps {
  onClose: () => void;
}

export default function PasswordChangeModal({ onClose }: PasswordChangeModalProps) {
  return (
    <Modal onClose={onClose}>
      <h3 className="text-lg font-semibold">비밀번호 변경</h3>
      <p className="text-gray-600">새로운 비밀번호를 입력하세요.</p>
      <input type="password" className="w-full p-2 mt-2 border rounded" placeholder="새 비밀번호" />
      <div className="flex justify-end mt-4">
        <button className="px-4 py-2 bg-gray-300 rounded mr-2" onClick={onClose}>
          취소
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded">변경하기</button>
      </div>
    </Modal>
  );
}
