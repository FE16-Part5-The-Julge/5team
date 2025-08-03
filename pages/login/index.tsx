import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import axiosInstance from '@/api/settings/axiosInstance';
import styles from '@/pages/login/login.module.css';
import Logo from '@/assets/img/logo.svg';
import Link from 'next/link';
import { isValidEmail, isValidPassword } from '@/utils/validators';
import { TextInput } from '@/components/common/inputs/TextInput';
import { BaseButton } from '@/components/common/BaseButton';
import { useUserContext } from '@/contexts/auth-context';
import useModal from '@/hooks/useModal';
import Alert from '@/components/Modal/Alert/Alert';

export default function Login() {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [emailError, setEmailError] = useState('');
	const [passwordError, setPasswordError] = useState('');
	const [loading, setLoading] = useState(false);
	const { setUser } = useUserContext();
	const pwModal = useModal();

	const validateForm = () => {
		let isValid = true;

		if (!isValidEmail(email)) {
			setEmailError('이메일 형식으로 작성해주세요');
			isValid = false;
		} else {
			setEmailError('');
		}

		if (!isValidPassword(password)) {
			setPasswordError('비밀번호는 8자 이상이어야 합니다');
			isValid = false;
		} else {
			setPasswordError('');
		}

		return isValid;
	};

	const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const isFormValid = validateForm();
		if (!isFormValid) return;

		try {
			setLoading(true);
			const res = await axiosInstance.post('/token', { email, password });

			const token = res.data.item.token;
			localStorage.setItem('token', token); //JWT토큰 저장

			const userData = res.data.item.user.item;
			let parsedUser: any = {
				id: userData.id,
				email: userData.email,
				type: userData.type,
			};
			// 사장님이면 shop 정보 추가 요청
			if (userData.type === 'employer') {
				const shopRes = await axiosInstance.get(`/users/${userData.id}`);
				parsedUser = {
					...parsedUser,
					shop: shopRes.data.item.shop,
				};
			}
			// 알바면 user정보 추가 요청
			if (userData.type === 'employee') {
				const userRes = await axiosInstance.get(`/users/${userData.id}`);
				parsedUser = userRes.data.item;
			}

			setUser(parsedUser);

			alert('로그인 성공');
			router.push('/');
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				const status = error.response?.status;

				if (status === 404) {
					pwModal.openModal();
				} else {
					pwModal.openModal();
				}
			} else {
				alert('예상치 못한 오류가 발생했습니다.');
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
				message: '비밀번호가 일치하지 않습니다.',
				onConfirm: pwModal.closeModal,
			})}
			<div className={styles.imgcontainer}>
				<button onClick={handleClickLogoImage}>
					<Logo />
				</button>
			</div>

			<form className={styles.formBox} onSubmit={handleLogin}>
				<TextInput
					id="email"
					label="이메일"
					type="email"
					value={email}
					onChange={e => setEmail(e.target.value)}
					onBlur={e =>
						setEmailError(isValidEmail(e.target.value) ? '' : '이메일 형식으로 작성해주세요')
					}
					error={emailError}
					placeholder="입력"
					className="emailInput"
					width="350px"
					required
				/>

				<TextInput
					id="password"
					label="비밀번호"
					type="password"
					value={password}
					onChange={e => setPassword(e.target.value)}
					onBlur={e =>
						setPasswordError(
							isValidPassword(e.target.value) ? '' : '비밀번호는 8자 이상이어야 합니다'
						)
					}
					error={passwordError}
					placeholder="입력"
					width="350px"
					required
				/>

				<BaseButton
					type="submit"
					color="red"
					size="medium"
					className={styles.loginButton}
					disabled={loading}
				>
					{loading ? '로그인하는중' : '로그인하기'}
				</BaseButton>
				<p className={styles.signupText}>
					회원이 아니신가요?{' '}
					<Link href="/register" className={styles.signupLink}>
						회원가입하기
					</Link>
				</p>
			</form>
		</div>
	);
}
