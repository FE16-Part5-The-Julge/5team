import axiosInstance from './settings/axiosInstance';

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
