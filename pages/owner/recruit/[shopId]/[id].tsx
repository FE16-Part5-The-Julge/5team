import { useRouter } from 'next/router';
import NoticePostCard from '@/components/common/NoticePostCard';
import { getNoticeId } from '@/api/employerNotice';
import { useEffect, useState } from 'react';
import { NoticeItem } from '@/types';
import { BaseButton } from '@/components/common/BaseButton';
import VolunteerListTable from './VolunteerListTable';

export default function RecruitDetailPage() {
	const router = useRouter();

	const [notice, setNotice] = useState<NoticeItem | null>(null);
	const [error, setError] = useState(false);

	const { shopId, id } = router.query;

	useEffect(() => {
		if (!shopId || !id || typeof shopId !== 'string' || typeof id !== 'string') return;

		const fetchNotice = async () => {
			try {
				const { item } = await getNoticeId(shopId, id);
				setNotice(item);
			} catch (err) {
				console.error('공고 데이터를 불러오지 못했습니다.', err);
				setError(true);
			}
		};

		fetchNotice();
	}, [shopId, id]);

	if (error) return <p>공고 데이터를 불러오지 못했습니다.</p>;
	if (!notice) return <p>공고가 존재하지 않습니다.</p>;

	return (
		<div>
			<NoticePostCard notice={notice}>
				<BaseButton color="white" size="noneSize">
					공고 편집하기
				</BaseButton>
			</NoticePostCard>
			{typeof id === 'string' && typeof shopId === 'string' && (
				<VolunteerListTable shopId={shopId} noticeId={id} />
			)}
		</div>
	);
}
