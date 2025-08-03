import axiosInstance from '../settings/axiosInstance';
import { Shop } from '@/types';

export interface GetNoticeByIdResponse {
	item: {
		id: string;
		hourlyPay: number;
		startsAt: string;
		workhour: number;
		description: string;
		closed: boolean;
		shop: {
			item: Shop;
			href: string;
		};
		currentUserApplication?: {
			item: {
				id: string;
				status: 'pending' | 'accepted' | 'rejected' | 'canceled';
				createdAt: string;
			};
		};
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
 * 가게의 특정 공고 상세 조회
 * @param shopId 가게 ID
 * @param noticeId 공고 ID
 * @returns 공고 상세 데이터
 */
export const getNoticeById = async (
	shopId: string,
	noticeId: string
): Promise<GetNoticeByIdResponse> => {
	const res = await axiosInstance.get(`/shops/${shopId}/notices/${noticeId}`);
	return res.data;
};
