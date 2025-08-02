import styles from './index.module.css';
import { BaseButton } from '@/components/common/BaseButton';
import PostCard from '@/components/UI/PostCard';
import SmallNoticePoastCard from '@/components/common/NoticePostCard/SmallNoticePoastCard';
import { useRouter } from 'next/router';
import { Shop, NoticeItem } from '@/types';
import { getShopId } from '@/api/getShopId';
import { getNoticeList } from '@/api/getNoticeList';
import { useEffect, useState } from 'react';
import { useUserContext } from '@/contexts/auth-context';

export default function StorePage() {
	const router = useRouter();
	const { user, isLoading: userLoading } = useUserContext();
	const [shop, setShop] = useState<any | null>(null);
	const [notices, setNotices] = useState<NoticeItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	useEffect(() => {
		if (userLoading) return;

		if (!user) {
			router.push('/login');
			return;
		}

		const fetchData = async () => {
			try {
				const { item } = await getShopId(user.id);
				setShop(item);

				if (item?.id) {
					const noticeData = await getNoticeList(item.id);

					const noticesArray: NoticeItem[] = noticeData.items.map(({ item: notice }) => ({
						...notice,
						shop: {
							item: item,
							href: `/shops/${item.id}`,
						},
						closed: false,
					}));

					setNotices(noticesArray);
				}
			} catch (err) {
				console.error('가게 또는 공고 데이터를 불러오지 못했습니다.', err);
				setError(true);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [user, userLoading, router]);

	if (userLoading || loading) return <p>로딩 중...</p>;
	if (error) return <p>데이터를 불러오는 데 실패했습니다.</p>;

	const isClosed = (notice: { startsAt: string; workhour: number }) => {
		const start = new Date(notice.startsAt);
		const end = new Date(start.getTime() + notice.workhour * 60 * 60 * 1000);
		return new Date() > end;
	};

	return (
		<div className={styles.storeContainer}>
			{/* 가게 정보 영역 */}
			<div className={styles.shopContainer}>
				<h1 className={styles.title}>내 가게</h1>
				{shop ? (
					<PostCard shop={shop} />
				) : (
					<div className={styles.emptyShop}>
						<p className={styles.emptyDescription}>내 가게를 소개하고 공고도 등록해 보세요.</p>
						<div className={styles.buttonGroup}>
							<BaseButton
								onClick={() => router.push('/owner/store/create')}
								size={'noneSize'}
								color={'red'}
							>
								가게 등록하기
							</BaseButton>
						</div>
					</div>
				)}
			</div>

			{/* 공고 리스트 영역 */}
			{shop && (
				<div className={styles.storeListContainer}>
					<h2 className={styles.subtitle}>내가 등록한 공고</h2>
					<div className={styles.noticeList}>
						{notices.length > 0 ? (
							notices.map(notice => {
								const closed = isClosed(notice);
								return (
									<div
										key={notice.id}
										className={styles.noticeItem}
										onClick={() => !closed && router.push(`/owner/recruit/${shop.id}/${notice.id}`)}
										aria-disabled={closed}
									>
										<SmallNoticePoastCard notice={{ ...notice, closed }} />
									</div>
								);
							})
						) : (
							<div className={styles.emptyShop}>
								<p className={styles.emptyDescription}>공고를 등록해 보세요.</p>
								<BaseButton
									onClick={() => router.push('/owner/recruit/create')}
									size={'medium'}
									color={'red'}
								>
									공고 등록하기
								</BaseButton>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
