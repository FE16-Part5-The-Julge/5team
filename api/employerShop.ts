import axiosInstance from '@/api/settings/axiosInstance';
import { Shop } from '@/types';
import type { AxiosError } from 'axios';
import type { Link } from '@/types/link';

export const getShopId = async (userId: string): Promise<{ item: Shop }> => {
	const res = await axiosInstance.get(`/users/${userId}`);
	const shop = res.data.item.shop?.item ?? null;
	return { item: shop };
};

type ReqShop = Omit<Shop, 'id'>;

type ResShop = {
	item: Shop & {
		user: {
			item: {
				id: string;
				email: string;
				type: string;
			};
			href: string;
		};
	};
	links: Link[];
};

export const registerShop = async (shopData: ReqShop): Promise<ResShop | string> => {
	try {
		const res = await axiosInstance.post('/shops', shopData, {
			headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
		});

		return res.data;
	} catch (err: unknown) {
		const error = err as AxiosError;

		if (error.response?.status === 401 || error.response?.status === 409) {
			// const errorMessage = (error.response?.data as { message: string }).message;
			const errorMessage =
				(error.response?.data as { message: string }).message ??
				error.message ??
				'알 수 없는 오류가 발생했습니다.';

			throw { status: error.response.status, message: errorMessage };
		} else {
			throw { status: error.response?.status || 500, message: '알 수 없는 오류가 발생했습니다.' };
		}
	}
};

export const editShop = async (shopData: ReqShop, shopId): Promise<ResShop | string> => {
	try {
		const res = await axiosInstance.put(`/shops/${shopId}`, shopData, {
			headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
		});

		return res.data;
	} catch (err: unknown) {
		const error = err as AxiosError;
		if (error.status === 401 || error.status === 403 || error.status === 404) {
			let errorMessage: string;
			switch (error.status) {
				case 401:
					errorMessage = '로그인이 필요합니다';
					break;
				case 403:
					errorMessage = '가게를 수정할 권한이 없습니다';
					break;
				case 404:
					errorMessage = '존재하지 않는 가게입니다';
			}

			throw {
				status: error.status,
				message: errorMessage,
			};
		} else {
			throw { status: error.response?.status || 500, message: '알 수 없는 오류가 발생했습니다.' };
		}
	}
};
