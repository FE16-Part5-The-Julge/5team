import axiosInstance from '@/api/settings/axiosInstance';
import { GetNoticeResponse } from '@/types/userNotice';
import { Shop } from '@/types/shop';

export type NoticeQueryParams = {
	offset: number;
	limit: number;
	address?: string;
	keyword?: string;
	startsAtGte?: string;
	hourlyPayGte?: number;
	sort?: 'time' | 'pay' | 'hour' | 'shop';
};

/**
 * 공고 목록을 조회하는 API
 * @param params 공고 필터 및 정렬 조건
 * @returns 공고 리스트 응답
 */
export const fetchNoticeList = async (params: NoticeQueryParams): Promise<GetNoticeResponse> => {
	const res = await axiosInstance.get('/notices', { params });
	return res.data;
};

export const getShopById = async (shopId: string): Promise<{ item: Shop }> => {
	const res = await axiosInstance.get(`/shops/${shopId}`);
	return { item: res.data.item };
};

export interface GetUserResponse {
	item: {
		id: string;
		email: string;
		type: string;
		shop: null;
	};
	links: {
		rel: string;
		description: string;
		method: string;
		href: string;
		body?: any;
		query?: Record<string, string>;
	}[];
}

/**
 * 사용자 정보 조회
 * @param userId 조회할 사용자 ID (UUID)
 * @param token 조회할 사용자 토큰
 */
export const getUser = async (userId: string, token: string) => {
	const res = await axiosInstance.get(`/users/${userId}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	return res.data;
};

export interface UpdateUserRequest {
	name: string;
	phone: string;
	address: string;
	bio: string;
}

export interface UpdateUserResponse {
	item: {
		id: string;
		email: string;
		type: string;
		name: string;
		phone: string;
		address: string;
		bio: string;
		shop: null;
	};
	links: {
		rel: string;
		description: string;
		method: string;
		href: string;
		body?: Record<string, any>;
		query?: Record<string, any>;
	}[];
}

/**
 * 사용자 정보 수정
 * @param userId 사용자 ID
 * @param token 조회할 사용자 토큰
 * @param data 수정할 데이터
 */
export const updateUser = async (userId: string, token: string, formData: UpdateUserRequest) => {
	const res = await axiosInstance.put(`/users/${userId}`, formData, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	return res.data;
};
