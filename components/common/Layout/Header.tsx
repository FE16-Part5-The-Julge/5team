//Hook
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import useWindowWidth from '@/hooks/useWindowWidth';
import { useUserContext } from '@/contexts/auth-context';

//style and svg
import styles from './Header.module.css';
import LogoImage from '@/assets/img/logo.svg';
import LogoImageSmall from '@/assets/img/logoSmall.svg';
import Search from '@/assets/img/search.svg';

//Components
import DropDownNotification from './DropDownNotification';

//api

export default function Header() {
	const [loginState, setLoginState] = useState(false); //로그인 state <假 데이터>
	const [inputValue, setInputValue] = useState('');
	const [mobileScreen, setMobileScreen] = useState(false); // 모바일 화면 상태
	const [loginType, setLoginType] = useState<string | null>(null);
	const windowWidth = useWindowWidth();
	const router = useRouter();
	const { user } = useUserContext();

	useEffect(() => {
		const token = localStorage.getItem('token');
		//console.log(user);
		if (token == null) {
			setLoginState(false);
		} else {
			const existingType = localStorage.getItem('type');

			if (existingType == null) {
				const valueToStore: any = user?.type; // 서버 진입 시 발생한 오류 때문에 옵셔널로 설정해둠
				localStorage.setItem('type', valueToStore);
			}

			setLoginState(true);
			if (localStorage.getItem('type') == 'employee') {
				setLoginType('employee');
			} else {
				setLoginType('employer');
			}
		}
	}, []);

	useEffect(() => {
		if (windowWidth <= 767) {
			setMobileScreen(true);
		} else {
			setMobileScreen(false);
		}
	}, [windowWidth]);

	const handleClickLogin = () => {
		router.push('/login');
	};

	const handleClickLogout = () => {
		router.push('/');
		localStorage.clear();
		setLoginState(false);
	};

	const handleClickSignup = () => {
		router.push('/register');
	};

	const handleClickMyShop = () => {
		router.push('/owner/store');
	};

	const handleClickMyProfile = () => {
		router.push('/employee/profile');
	};

	const handleClickLogoInHeader = () => {
		router.push('/');
	};
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
	};

	// posts 페이지 검색기능 추가
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!inputValue.trim()) return;
		router.push(`/posts?search=${encodeURIComponent(inputValue.trim())}`);
	};

	return (
		<>
			<div className={styles.header}>
				<div className={styles.headerContent}>
					{mobileScreen ? (
						<>
							<div className={styles.logoStyle}>
								<button onClick={handleClickLogoInHeader}>
									<LogoImage id={styles.logoItem} />
								</button>
							</div>
							<div className={styles.headerSearchBox}>
								<div>
									<Search id={styles.searchItem} />
								</div>
								<div className={styles.inputTag}>
									<form onSubmit={handleSubmit}>
										<input
											type="text"
											name="headerSearch"
											value={inputValue}
											onChange={handleChange}
											placeholder="가게 이름으로 찾아보세요"
										/>
									</form>
								</div>
							</div>
						</>
					) : (
						<div className={styles.headerLogoAndSearch}>
							<div className={styles.logoStyle}>
								<button onClick={handleClickLogoInHeader}>
									<LogoImage />
								</button>
							</div>
							<div className={styles.headerSearchBox}>
								<Search />
								<div className={styles.inputTag}>
									<form onSubmit={handleSubmit}>
										<input
											type="text"
											name="headerSearch"
											value={inputValue}
											onChange={handleChange}
											placeholder="가게 이름으로 찾아보세요"
										/>
									</form>
								</div>
							</div>
						</div>
					)}
					<div className={styles.headerMenu}>
						{loginState ? (
							<>
								{loginType === 'employer' ? (
									<button onClick={handleClickMyShop}>내 가게</button>
								) : (
									<button onClick={handleClickMyProfile}>내 프로필</button>
								)}
								<button onClick={handleClickLogout}>로그아웃</button>
								<DropDownNotification />
							</>
						) : (
							<>
								<div className={styles.noneLogin}>
									<button onClick={handleClickLogin}>로그인</button>
									<button onClick={handleClickSignup}>회원가입</button>
								</div>
							</>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
