import React, { ReactNode } from 'react';
import { useRouter } from 'next/router';
import styles from 'components/common/Layout/Layout.module.css';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
	children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
	const router = useRouter();
	if (router.pathname === '/login' || router.pathname === '/register') {
		return <main className={styles.main}>{children}</main>;
	}
	const noHeader = ['/login', '/register'];
	const noFooter = ['/owner/store/create', '/owner/store/edit'];
	const isFooterHidden = noFooter.includes(router.pathname);
	const isHeaderHidden = noHeader.includes(router.pathname);

	// Store pages that need background color
	const grayPages = [
		'/owner/store/create',
		'/owner/store/edit',
		'/owner/recruit/create',
		'/employee/profile',
	];
	const isGrayPage =
		grayPages.includes(router.pathname) ||
		router.pathname.includes('/owner/recruit/') ||
		router.pathname.includes('/posts/');

	return (
		<>
			{!isHeaderHidden && <Header />}
			<main className={`${styles.main} ${isGrayPage ? styles['gray-pages'] : ''}`}>{children}</main>
			{!isFooterHidden && <Footer />}
		</>
	);
}
