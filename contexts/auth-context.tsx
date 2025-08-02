import { createContext, useContext, useEffect, useState } from 'react';
import axiosInstance from '@/api/settings/axiosInstance';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/router';
import { ShopWrapper } from '@/types/shop';

interface User {
	id: string;
	email: string;
	type: 'employee' | 'employer';
	name?: string;
	phone?: string;
	address?: string;
	bio?: string;
	shop?: ShopWrapper | null;
}

interface UserContextType {
	user: User | null;
	setUser: (user: User | null) => void;
	isLoading: boolean;
	logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
		if (!token) {
			setIsLoading(false);
			return;
		}

		try {
			const decoded = jwtDecode<{ userId: string }>(token);
			const id = decoded.userId;

			axiosInstance
				.get(`/users/${id}`)
				.then(res => {
					const userData = res.data.item;
					setUser(userData);
				})
				.catch(() => {
					localStorage.removeItem('token');
					setUser(null);
				})
				.finally(() => {
					setIsLoading(false);
				});
		} catch (err) {
			console.error('JWT 디코딩 실패:', err);
			localStorage.removeItem('token');
			setIsLoading(false);
		}
	}, []);

	const logout = () => {
		localStorage.removeItem('token');
		setUser(null);
		router.push('/login');
	};

	return (
		<UserContext.Provider value={{ user, setUser, isLoading, logout }}>
			{children}
		</UserContext.Provider>
	);
};

export const useUserContext = () => {
	const context = useContext(UserContext);
	if (!context) {
		throw new Error('useUserContext must be used within a UserProvider');
	}
	return context;
};
