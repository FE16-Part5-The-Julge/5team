import styles from './Action.module.css';
import { ReactNode } from 'react';
import Modal from '@/components/Modal/Modal/Modal';
import buttonStyles from '@/components/common/BaseButton/BaseButton.module.css';
import CheckingIcon from '@/assets/img/checking.svg';

interface ActionModalProps {
	message: string;
	cofirmText?: string;
	cancelText?: string;
	onConfirm: () => void;
	onCancel: () => void;
	onClose: () => void;
	isOpen: boolean;
	children?: ReactNode;
}

export default function Action({
	message,
	cancelText,
	cofirmText,
	onConfirm,
	onCancel,
	onClose,
	isOpen,
}: ActionModalProps) {
	return (
		<Modal className="action" isOpen={isOpen ?? true} onClose={onClose ?? (() => {})}>
			<div className={styles.content}>
				<div className={styles.icon}>
					<CheckingIcon alt="checking" />
				</div>
				<div className={styles.message}>{message}</div>
			</div>
			<div className={styles.buttonGroup}>
				<button
					className={`${styles.button} ${buttonStyles.button} ${buttonStyles.red}`}
					onClick={onCancel}
				>
					{cancelText}
				</button>
				<button
					className={`${styles.button} ${buttonStyles.button} ${buttonStyles.white}`}
					onClick={onConfirm}
				>
					{cofirmText}
				</button>
			</div>
		</Modal>
	);
}
