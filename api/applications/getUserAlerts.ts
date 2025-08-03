import axiosInstance from '../settings/axiosInstance';

export const getUserAlerts = async (userId: string, token: string) => {
	console.log(`userID!! : ${userId}`);
	const res = await axiosInstance.get(`/users/${userId}/applications`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	return res.data;
};
