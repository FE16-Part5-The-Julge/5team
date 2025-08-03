import axiosInstance from '../settings/axiosInstance';

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
