import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import styles from './postDetail.module.css';
import btnStyles from '@/components/common/BaseButton/BaseButton.module.css';

import { getNoticeId } from '@/api/employerNotice';
import { getShopById } from '@/api/usersInfo';
import { fetchNoticeList } from '@/api/usersInfo';
import { applyNotice } from '@/api/applications/applyNotice';
import { updateApplication } from '@/api/applications/updateApplication';
import { getUser } from '@/api/usersInfo';

import { Notice } from '@/types/userNotice';
import { Shop } from '@/types';

import SmallNoticePoastCard from '@/components/common/NoticePostCard/SmallNoticePoastCard';
import NoticePostCard from '@/components/common/NoticePostCard';
import Confirm from '@/components/Modal/Confirm/Confirm';
import Action from '@/components/Modal/Action/Action';

import { useUserContext } from '@/contexts/auth-context';
import { getNoticeById } from '@/api/applications/getNoticeId';
import { isClosed } from '@/utils/closedNotice';

import { getRecentShops, saveRecentShops } from '@/utils/recentShopList'; //Helper Func - 최근 방문 공고 로컬스토리지 저장

const PostDetailPage = () => {
	const router = useRouter();
	const { user } = useUserContext();
	const { shopId, id: noticeId } = router.query;

	const [notice, setNotice] = useState<Notice | null>(null);
	const [shop, setShop] = useState<Shop | null>(null);
	const [newlyNotices, setNewlyNotices] = useState<Notice[]>([]);
	const [applicationId, setApplicationId] = useState<string | null>(null);

	const [isLoading, setIsLoading] = useState(true);
	const [isApplied, setIsApplied] = useState(false);

	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const [isActionOpen, setIsActionOpen] = useState(false);
	const [alertMessage, setAlertMessage] = useState('');

	const [recentShops, setRecentShops] = useState<string[]>([]);

	// 최초 렌더링
	useEffect(() => {
		if (!shopId || !noticeId) return;

		const fetchData = async () => {
			try {
				const noticeRes = await getNoticeId(shopId as string, noticeId as string);
				const noticeItem = noticeRes.item;

				let shopItem: Shop;
				if (noticeItem?.shop?.item) {
					shopItem = noticeItem.shop.item;
				} else {
					const shopRes = await getShopById(shopId as string);
					if (!shopRes.item) throw new Error('Shop not found');
					shopItem = shopRes.item;
				}

				if (!noticeItem || !shopItem) throw new Error('데이터 없음');

				setNotice({ ...noticeItem, closed: isClosed(noticeItem) });
				setShop(shopItem);
				//setNewlyNotices(listRes.items.map(({ item }) => ({ ...item, closed: isClosed(item) })));
			} catch {
				setAlertMessage('페이지 정보를 불러오지 못했습니다.');
				setIsConfirmOpen(true);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();

		if (noticeId) {
			saveRecentShops(noticeId);
		}
	}, [shopId, noticeId]);

	// 로컬스토리지 확인해서 사장님이면 리다이렉트 처리
	useEffect(() => {
		if (!shop || !notice) return;
		if (typeof window === 'undefined') return;

		const type = localStorage.getItem('type');
		if (type === 'employer') {
			router.push(`/owner/recruit/${shop.id}/${notice.id}`);
		}
	}, [shop, notice, router]);

	// 기존 지원 여부 기록
	useEffect(() => {
		const checkIfAlreadyApplied = async () => {
			if (!user || !shopId || !noticeId) return;

			try {
				const res = await getNoticeById(shopId as string, noticeId as string);
				const app = res.item.currentUserApplication;

				if (app?.item) {
					setIsApplied(true);
					setApplicationId(app.item.id);
				}
			} catch (err) {
				console.error('지원 여부 확인 실패', err);
			}
		};

		checkIfAlreadyApplied();
	}, [user, shopId, noticeId]);

	useEffect(() => {
		if (recentShops.length === 0) return;

		const updateNoticeBoard = async () => {
			const res = await fetchNoticeList({ offset: 0, limit: 100 });
			const allNotices = res.items.map(({ item }) => ({ ...item, closed: isClosed(item) }));
			//const filteredNotices = allNotices.filter(notice => recentShops.includes(String(notice.id)));
			const filteredNotices = recentShops
				.map(id => allNotices.find(notice => String(notice.id) === id))
				.filter((n): n is Notice => !!n);

			setNewlyNotices(filteredNotices);
		};
		updateNoticeBoard();
	}, [recentShops]);

	useEffect(() => {
		const shopIds = getRecentShops();
		setRecentShops(shopIds);
	}, []);

	const handleCardClick = (notice: Notice) => {
		const shopId = notice.shop?.item?.id;
		if (shopId) {
			router.push(`/posts/${shopId}/${notice.id}`);
		}
	};

	if (isLoading) return null;
	if (!notice || !shop) return <p>존재하지 않는 공고입니다.</p>;

	const handleApplyClick = async () => {
		if (!user) {
			setAlertMessage('로그인이 필요합니다');
			setIsConfirmOpen(true);
			return;
		}

		try {
			const type = localStorage.getItem('type');
			const token = localStorage.getItem('token');
			if (!token || !type) return;

			const profileRes = await getUser(user.id, token);
			const { name, phone, address, bio } = profileRes.item;

			if (!name || !phone || !address || !bio) {
				setAlertMessage('내 프로필을 먼저 등록해 주세요');
				setIsConfirmOpen(true);
				return;
			}
			if (isApplied) return;

			const res = await applyNotice(shop.id, notice.id);
			const newApplicationId = res.item?.id;
			if (newApplicationId) {
				setApplicationId(newApplicationId);
				setIsApplied(true);
			}
		} catch {
			setAlertMessage('프로필 정보를 불러오지 못했거나, 신청 처리에 실패했습니다.');
			setIsConfirmOpen(true);
		}
	};

	const handleCancleClick = () => {
		setAlertMessage('신청을 취소하겠습니까?');
		setIsActionOpen(true);
	};

	const handleCancleConfirm = async () => {
		try {
			if (!applicationId) throw new Error('지원 id 없음');
			await updateApplication(shop.id, notice.id, applicationId, 'canceled');
			setIsApplied(false);
		} catch {
			setAlertMessage('신청 취소 처리에 실패했습니다.');
			setIsConfirmOpen(true);
		} finally {
			setIsActionOpen(false);
		}
	};

	return (
		<div className={styles.container}>
			<div>
				<NoticePostCard notice={notice}>
					{notice.closed ? (
						<button className={`${styles.button} ${btnStyles.gray}`} disabled>
							신청 불가
						</button>
					) : isApplied ? (
						<button className={`${styles.button} ${btnStyles.white}`} onClick={handleCancleClick}>
							취소하기
						</button>
					) : (
						<button className={`${styles.button} ${btnStyles.red}`} onClick={handleApplyClick}>
							신청하기
						</button>
					)}
				</NoticePostCard>
			</div>
			<div className={styles.newlyPostWrapper}>
				<span className={styles.title}>최근에 본 공고</span>
				<div className={styles.newlyPost}>
					{newlyNotices.map((item, idx) => (
						<SmallNoticePoastCard key={idx} notice={item} onClick={() => handleCardClick(item)} />
					))}
				</div>
			</div>

			{isConfirmOpen && (
				<Confirm
					message={alertMessage}
					isOpen={isConfirmOpen}
					onClose={() => setIsConfirmOpen(false)}
					onConfirm={() => router.push('/employee/profile/create')}
				/>
			)}
			{isActionOpen && (
				<Action
					message={alertMessage}
					isOpen={isActionOpen}
					onClose={() => setIsActionOpen(false)}
					onCancel={() => setIsActionOpen(false)}
					onConfirm={handleCancleConfirm}
					cancelText="아니요"
					cofirmText="취소하기"
				/>
			)}
		</div>
	);
};

export default PostDetailPage;
