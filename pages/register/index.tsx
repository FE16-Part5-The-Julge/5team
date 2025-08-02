import { useRouter } from 'next/router';
import { useState } from 'react';
import styles from '@/pages/register/register.module.css';
import Logo from '@/assets/img/logo.svg';
import CheckedImg from '@/assets/img/checking.svg';
import { TextInput } from '@/components/common/inputs/TextInput';
import { BaseButton } from '@/components/common/BaseButton';
import axios from 'axios';
import axiosInstance from '@/api/settings/axiosInstance';
import useModal from '@/hooks/useModal';
import Alert from '@/components/Modal/Alert/Alert';

export default function Register() {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [userType, setUserType] = useState<'worker' | 'owner' | null>(null);
	const [error, setError] = useState<{ [key: string]: string }>({});
	const [loading, setLoading] = useState(false);
	const pwModal = useModal();

	const validateEmail = () => {
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			setError(prev => ({ ...prev, email: '이메일 형식으로 작성해 주세요.' }));
			return false;
		} else {
			setError(prev => ({ ...prev, email: '' }));
			return true;
		}
	};

	const validatePassword = () => {
		if (password.length < 8) {
			setError(prev => ({ ...prev, password: '8자 이상 입력해주세요.' }));
			return false;
		} else {
			setError(prev => ({ ...prev, password: '' }));
			return true;
		}
	};

	const validateConfirm = () => {
		if (password !== confirmPassword) {
			setError(prev => ({ ...prev, confirm: '비밀번호가 일치하지 않습니다.' }));
			return false;
		} else {
			setError(prev => ({ ...prev, confirm: '' }));
			return true;
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const isEmailValid = validateEmail();
		const isPasswordValid = validatePassword();
		const isConfirmValid = validateConfirm();

		if (!isEmailValid || !isPasswordValid || !isConfirmValid || !userType) {
			if (!userType) {
				setError(prev => ({ ...prev, userType: '회원 유형을 선택해 주세요.' }));
			}
			return;
		}

		try {
			setLoading(true);
			const res = await axiosInstance.post('/users', {
				email,
				password,
				type: userType === 'worker' ? 'employee' : 'employer', // 변환
			});

			if (res.status === 201) {
				alert('가입이 완료되었습니다.');
				router.push('/login');
			}
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				const status = error.response?.status;
				const message = error.response?.data?.message;

				if (status === 400) {
					alert(message || '요청 형식이 올바르지 않습니다.');
				} else if (status === 409) {
					pwModal.openModal();
				} else {
					alert('회원가입 중 문제가 발생했습니다.');
				}
			} else {
				alert('알 수 없는 오류가 발생했습니다.');
			}
		} finally {
			setLoading(false);
		}
	};

	const handleClickLogoImage = () => {
		router.push('/posts');
	};

	return (
		<div className={styles.container}>
			{pwModal.renderModal(Alert, {
				message: '이미 사용중인 이메일 입니다',
				onConfirm: pwModal.closeModal,
			})}
			<div className={styles.imgcontainer}>
				<button onClick={handleClickLogoImage}>
					<Logo />
				</button>
			</div>

			<form className={styles.formBox} onSubmit={handleSubmit}>
				<TextInput
					id="email"
					label="이메일"
					value={email}
					onChange={e => setEmail(e.target.value)}
					onBlur={validateEmail}
					error={error.email}
					placeholder="입력"
					width="350px"
					required
					className={styles.forms}
				/>

				<TextInput
					id="password"
					label="비밀번호"
					type="password"
					value={password}
					onChange={e => setPassword(e.target.value)}
					onBlur={validatePassword}
					error={error.password}
					placeholder="입력"
					width="350px"
					required
					className={styles.forms}
				/>

				<TextInput
					id="confirmPassword"
					label="비밀번호 확인"
					type="password"
					value={confirmPassword}
					onChange={e => setConfirmPassword(e.target.value)}
					onBlur={validateConfirm}
					error={error.confirm}
					placeholder="입력"
					width="350px"
					required
					className={styles.forms}
				/>

				<div className={styles.userTypeSection}>
					<span className={styles.label}>회원 유형</span>
					<div className={styles.userTypeToggle}>
						<button
							type="button"
							onClick={() => setUserType('worker')}
							className={`${styles.typeButton} ${userType === 'worker' ? styles.selected : ''}`}
						>
							{userType === 'worker' ? <CheckedImg /> : <span className="cirlce"></span>}
							알바님
						</button>

						<button
							type="button"
							onClick={() => setUserType('owner')}
							className={`${styles.typeButton} ${userType === 'owner' ? styles.selected : ''}`}
						>
							{userType === 'owner' ? <CheckedImg /> : <span className="circle"></span>}
							사장님
						</button>
					</div>
				</div>

				<BaseButton
					type="submit"
					color="red"
					size="medium"
					className={styles.submitButton}
					disabled={loading}
				>
					{loading ? '가입 중.....' : '가입하기'}
				</BaseButton>

				<p className={styles.loginText}>
					이미 가입하셨나요?{' '}
					<span className={styles.loginLink} onClick={() => router.push('/login')}>
						로그인하기
					</span>
				</p>
			</form>
		</div>
	);
}
