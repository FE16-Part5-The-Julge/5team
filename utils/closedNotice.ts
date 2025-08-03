export const isClosed = (notice: { startsAt: string; workhour: number }) => {
	const start = new Date(notice.startsAt);
	const end = new Date(start.getTime() + notice.workhour * 60 * 60 * 1000);
	return new Date() > end;
};
