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
 * 공고 지원 취소 API
 * @param shopId 가게 ID
 * @param noticeId 공고 ID
 * @param applicationId 지원 ID
 * @returns 지원 수정 응답
 */
export const updateApplication = async (
	shopId: string,
	noticeId: string,
	applicationId: string,
	status: 'pending' | 'accepted' | 'rejected' | 'canceled'
): Promise<ApplicationResponse> => {
	const res = await axiosInstance.put(
		`/shops/${shopId}/notices/${noticeId}/applications/${applicationId}`,
		{ status }
	);
	return res.data;
};
