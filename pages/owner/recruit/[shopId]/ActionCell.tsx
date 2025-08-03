import React, { useState } from 'react';
import { updateApplication } from '@/api/applications/updateApplication';
import styles from './VolunteerListTable.module.css';

interface ActionCellProps {
	shopId: string;
	noticeId: string;
	applyId: string;
	initialStatus: string;
	// 부모의 상태를 업데이트하기 위한 함수를 props로 받습니다.
	onStatusUpdate: (applyId: string, newStatus: 'accepted' | 'rejected') => void;
}

const ActionCell = ({
	shopId,
	noticeId,
	applyId,
	initialStatus,
	onStatusUpdate,
}: ActionCellProps) => {
	// 이제 useState는 리액트 컴포넌트 안에서 안전하게 사용됩니다.
	const [loading, setLoading] = useState(false);

	const onClickStatusChange = async (newStatus: 'accepted' | 'rejected') => {
		if (loading) return; // 중복 클릭 방지
		setLoading(true);
		try {
			await updateApplication(shopId, noticeId, applyId, newStatus);
			// API 호출 성공 시, 부모 컴포넌트의 상태를 업데이트하는 함수를 호출합니다.
			onStatusUpdate(applyId, newStatus);
		} catch (e) {
			const err = e as Error;
			alert('상태 변경에 실패했습니다: ' + err.message);
		} finally {
			setLoading(false);
		}
	};

	// 상태는 부모로부터 받은 initialStatus를 기준으로 표시합니다.
	if (initialStatus === 'accepted') {
		return <span className={styles.statusAccepted}>승인완료</span>;
	}
	if (initialStatus === 'rejected') {
		return <span className={styles.statusRejected}>거절됨</span>;
	}

	return (
		<div className={styles.actions}>
			<button
				className={styles.refuse}
				disabled={loading}
				onClick={() => onClickStatusChange('rejected')}
			>
				{loading ? '...' : '거절하기'}
			</button>
			<button
				className={styles.admit}
				disabled={loading}
				onClick={() => onClickStatusChange('accepted')}
			>
				{loading ? '...' : '승인하기'}
			</button>
		</div>
	);
};

export default ActionCell;
