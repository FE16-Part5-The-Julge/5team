import axiosInstance from '@/api/settings/axiosInstance';
import { NoticeItem } from '@/types';
import { ShopNoticeResponse } from '@/types';

export const getNoticeId = async (
	shopId: string,
	noticeId: string
): Promise<{ item: NoticeItem }> => {
	const res = await axiosInstance.get(`/shops/${shopId}/notices/${noticeId}`);
	const notice = res.data.item ?? null;
	return { item: notice };
};

export const getNoticeList = async (shopId: string): Promise<ShopNoticeResponse> => {
	const res = await axiosInstance.get(`/shops/${shopId}/notices`);
	return res.data;
};

interface CreateNoticeParams {
	shopId: string;
	hourlypay: string;
	startsAt: string;
	workhour: string;
	description: string;
	token: string;
}

export const createNotice = async ({
	shopId,
	hourlypay,
	startsAt,
	workhour,
	description,
	token,
}: CreateNoticeParams) => {
	const res = await axiosInstance.post(
		`/shops/${shopId}/notices`,
		{
			hourlyPay: Number(hourlypay),
			startsAt,
			workhour: Number(workhour),
			description,
		},
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);

	return res.data;
};
