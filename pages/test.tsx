import style from '@/styles/test.module.css';
import Alert from '@/components/Modal/Alert/Alert';
import Confirm from '@/components/Modal/Confirm/Confirm';
import Action from '@/components/Modal/Action/Action';
import useModal from '@/hooks/useModal';
import Notification from '@/components/Modal/Notification/Notification';
import { MyNotification as MyNotificationType } from '@/types/notification';

export default function Test() {
	const pwModal = useModal();
	const actModal = useModal();
	const confirmModal = useModal();
	const notificationModal = useModal();

	const notifications: MyNotificationType[] = [
		{
			id: 1,
			store: 'HS 과일주스',
			date: '2023-01-14',
			time: '15:00~18:00',
			status: '승인',
			ago: '1분 전',
		},
		{
			id: 2,
			store: '수리 에스프레소 샵',
			date: '2023-01-14',
			time: '15:00~18:00',
			status: '거절',
			ago: '7분 전',
		},
	];

	return (
		<div className={style.test}>
			<div>
				<button onClick={pwModal.openModal}>Alert 모달 오픈 버튼</button>
				{pwModal.renderModal(Alert, {
					message: '비밀번호가 일치하지 않습니다.',
					onConfirm: pwModal.closeModal,
				})}
			</div>
			<div>
				<button onClick={actModal.openModal}>Action 모달 오픈 버튼</button>
				{actModal.renderModal(Action, {
					message: '신청을 취소하시겠어요?',
					cancelText: '아니오',
					cofirmText: '취소하기',
					onCancel: actModal.closeModal,
					onConfirm: () => {
						window.alert('취소하기 클릭');
						actModal.closeModal();
					},
				})}
			</div>
			<div>
				<button onClick={confirmModal.openModal}>Confirm 모달 오픈 버튼</button>
				{confirmModal.renderModal(Confirm, {
					message: '내 프로필을 먼저 등록해주세요.',
					onConfirm: confirmModal.closeModal,
				})}
			</div>
			<div>
				<button onClick={notificationModal.openModal}>Notification 모달 오픈 버튼</button>
				{notificationModal.isOpen && (
					<Notification notifications={notifications} onClose={notificationModal.closeModal} />
				)}
			</div>
		</div>
	);
}
