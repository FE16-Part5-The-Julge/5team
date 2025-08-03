import NotificationCard from './NotificationCard';
import styles from './Notification.module.css';
import { ReactNode } from 'react';
import { MyNotification } from '@/types/notification';
import CloseIcon from '@/assets/img/closeIcon.svg';

interface NotificationProps {
	notifications: any;
	onClose: () => void;
	children?: ReactNode;
}

export default function Notification({ notifications, onClose }: NotificationProps) {
	const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) {
			onClose();
		}

		if (notifications.length == 0) {
			<h1 className={styles.headerTitle}>알림 없음</h1>;
		}
	};

	return (
		<div className={styles.overlay} onClick={handleOverlayClick}>
			<div className={styles.notification}>
				<div className={styles.header}>
					<h1 className={styles.headerTitle}>알림 {notifications.length}개</h1>
					<div className={styles.closeIcon}>
						<CloseIcon onClick={onClose} />
					</div>
				</div>
				<div className={styles.list}>
					{notifications.map(n => (
						<NotificationCard key={n.id} {...n} />
					))}
				</div>
			</div>
		</div>
	);
}
