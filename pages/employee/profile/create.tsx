import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { TextInput } from '@/components/common/inputs/TextInput';
import { DropdownInput } from '@/components/common/inputs/DropdownInput';
import { TextareaInput } from '@/components/common/inputs/TextareaInput';
import Alert from '@/components/Modal/Alert/Alert';
import { getUser } from '@/api/usersInfo';
import { updateUser } from '@/api/usersInfo';

import buttonStyle from '@/components/common/BaseButton/BaseButton.module.css';
import styles from './create.module.css';
import { useUserContext } from '@/contexts/auth-context';

const Create = () => {
	const [name, setName] = useState('');
	const [phone, setPhone] = useState('');
	const [address, setAddress] = useState('');
	const [bio, setBio] = useState('');
	const [isAlertOpen, setIsAlertOpen] = useState(false);
	const [alertMessage, setAlertMessage] = useState('');
	const [phoneError, setPhoneError] = useState('');

	const router = useRouter();
	const { user } = useUserContext();
	const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

	useEffect(() => {
		if (!user) {
			router.push('/login');
			return;
		}

		if (!token) {
			router.push('/login');
			return;
		}

		getUser(user.id, token)
			.then(userData => {
				if (userData?.item) {
					const { name, phone, address, bio } = userData.item;
					setName(name || '');
					setPhone(phone || '');
					setAddress(address || '');
					setBio(bio || '');
				}
			})
			.catch(() => {
				setAlertMessage('사용자 정보를 불러오는데 실패했습니다.');
				setIsAlertOpen(true);
			});
	}, [user, token, router]);

	const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setPhone(value);

		if (value === '') {
			setPhoneError('');
		} else if (!/^\d{3}-\d{4}-\d{4}$/.test(value)) {
			setPhoneError('연락처를 형식에 맞게 입력해주세요. (010-0000-0000)');
		} else {
			setPhoneError('');
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user || !user.id) return;
		if (!token) return;
		try {
			await updateUser(user.id, token, { name, phone, address, bio });

			setAlertMessage('등록이 완료되었습니다.');
			setIsAlertOpen(true);
		} catch {
			setAlertMessage('등록에 실패했습니다.');
			setIsAlertOpen(true);
		}
	};

	const handleAlertConfirm = () => {
		router.push('/employee/profile');
	};

	const handleAlertClose = () => {
		setIsAlertOpen(false);
	};

	const isDisabled: boolean = !name || !phone || !address || !bio || !!phoneError;
	return (
		<>
			<div className={styles.container}>
				<div className={styles.titleWrapper}>
					<p className={styles.title}>내 프로필</p>
					<button onClick={() => router.push('/employee/profile')}>
						<Image src="/img/icon/closeIcon.svg" alt="프로필 닫기" width={24} height={24} />
					</button>{' '}
				</div>
				<form onSubmit={handleSubmit} className={styles.form}>
					<div className={styles.inputWrapper}>
						<div className={styles.input}>
							<TextInput
								id="name"
								label="이름"
								value={name}
								onChange={e => setName(e.target.value)}
								placeholder="입력"
								required
							/>
						</div>
						<div className={styles.input}>
							<TextInput
								id="phone"
								label="연락처 "
								value={phone}
								onChange={handlePhoneChange}
								placeholder="010-0000-0000"
								required
								error={phoneError}
							/>
						</div>
						<div className={styles.input}>
							<DropdownInput
								id="address"
								label="선호 지역"
								value={address}
								onSelectOption={value => setAddress(value)}
								placeholder="선택"
								required
							/>
						</div>
					</div>
					<div>
						<TextareaInput
							id="bio"
							label="소개"
							value={bio}
							onChange={e => setBio(e.target.value)}
							placeholder="입력"
							required
						/>
					</div>
					<div className={styles.buttonWrapper}>
						<button
							type="submit"
							disabled={isDisabled}
							className={`${buttonStyle.button} ${
								isDisabled ? buttonStyle.disabled : buttonStyle.red
							} ${styles.button}`}
						>
							등록하기
						</button>
					</div>
				</form>

				<Alert
					isOpen={isAlertOpen}
					message={alertMessage}
					onConfirm={handleAlertConfirm}
					onClose={handleAlertClose}
				></Alert>
			</div>
		</>
	);
};

export default Create;
