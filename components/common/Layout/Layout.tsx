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

	return (
		<>
			<Header />
			<main className={styles.main}>{children}</main>
			<Footer />
		</>
	);
}
