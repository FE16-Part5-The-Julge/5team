import axiosInstance from '../settings/axiosInstance';

export interface ApplicationResponse {
	item: {
		id: string;
		status: 'pending' | 'accepted' | 'rejected' | 'canceled';
		createdAt: string;
		user: {
			item: {
				id: string;
				email: string;
				type: 'employer' | 'employee';
				name?: string;
				phone?: string;
				address?: string;
				bio?: string;
			};
			href: string;
		};
		shop: {
			item: {
				id: string;
				name: string;
				category: string;
				address1: string;
				address2: string;
				description: string;
				imageUrl: string;
				originalHourlyPay: number;
			};
			href: string;
		};
		notice: {
			item: {
				id: string;
				hourlyPay: number;
				description: string;
				startsAt: string;
				workhour: number;
				closed: boolean;
			};
			href: string;
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
 * 가게의 특정 공고에 지원 등록
 * @param shopId 가게 ID
 * @param noticeId 공고 ID
 * @param token 사용자 인증 토큰
 * @returns 지원 등록 응답 데이터
 */
export const applyNotice = async (
	shopId: string,
	noticeId: string
): Promise<ApplicationResponse> => {
	const res = await axiosInstance.post(`/shops/${shopId}/notices/${noticeId}/applications`);
	return res.data;
};
