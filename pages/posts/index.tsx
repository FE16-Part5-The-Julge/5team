import { GetServerSideProps } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import styles from './posts.module.css';

import { Notice, GetNoticeResponse } from '@/types/userNotice';
import { fetchNoticeList, NoticeQueryParams } from '@/api/users/getNotice';
import { getUser } from '@/api/users/getUser';
import SmallNoticePoastCard from '@/components/common/NoticePostCard/SmallNoticePoastCard';
import DetailFilter from '@/components/UI/DetailFilter';
import Confirm from '@/components/Modal/Confirm/Confirm';

import { formatToRFC3339 } from '@/utils/dayformatting';
import { isClosed } from '@/utils/closedNotice';
import { useUserContext } from '@/contexts/auth-context';
import useModal from '@/hooks/useModal';

const PERSONAL_NOTICE_LIMIT = 30;
const NOTICE_LIMIT = 6;
const sortOptions = [
	{ label: '마감임박순', value: 'time' },
	{ label: '시급많은순', value: 'pay' },
	{ label: '시간적은순', value: 'hour' },
	{ label: '가나다순', value: 'shop' },
];

interface Props {
	personalNotices: GetNoticeResponse;
	initialNotices: GetNoticeResponse;
}

interface DetailFilterState {
	startsAtGte: string;
	hourlyPayGte: string;
	selectedAddress: string | null;
}

export const getServerSideProps: GetServerSideProps = async () => {
	const address = '서울시 마포구'; // 로그인 안했을 때 기본값

	const personalNotices = await fetchNoticeList({
		offset: 0,
		limit: PERSONAL_NOTICE_LIMIT,
		address,
	});

	const initialNotices = await fetchNoticeList({ offset: 0, limit: NOTICE_LIMIT });
	return {
		props: {
			personalNotices,
			initialNotices,
		},
	};
};

const Posts = ({ personalNotices, initialNotices }: Props) => {
	// 맞춤공고
	const [noticesToShow, setNoticesToShow] = useState(3);
	const initialCustomNotices = personalNotices.items
		.filter(({ item }) => !isClosed(item))
		.slice(0, noticesToShow);
	const [customNotices, setCustomNotices] = useState(initialCustomNotices);

	// 필터 관련
	const [showFilter, setShowFilter] = useState(false);
	const [sortOption, setSortOption] = useState<'time' | 'pay' | 'hour' | 'shop'>('time');
	const [showDetailFilter, setShowDetailFilter] = useState(false);
	const [detailFilterCount, setDetailFilterCount] = useState(0);

	// 검색 관련 상태관리
	const [detailFilterState, setDetailFilterState] = useState<DetailFilterState>({
		startsAtGte: '',
		hourlyPayGte: '',
		selectedAddress: '',
	});

	const [appliedFilterState, setAppliedFilterState] = useState<DetailFilterState>({
		startsAtGte: '',
		hourlyPayGte: '',
		selectedAddress: null,
	});

	// 모달 관련
	const { isOpen, openModal, closeModal } = useModal();
	const [modalMessage, setModalMessage] = useState('');

	// 유저 정보 가져오기
	const { user } = useUserContext();

	// 검색기능
	const router = useRouter();
	const searchQuery = typeof router.query.search === 'string' ? router.query.search : '';

	// 페이지네이션
	const [notices, setNotices] = useState(initialNotices.items);
	const [offset, setOffset] = useState(initialNotices.offset);
	const [hasNext, setHasNext] = useState(initialNotices.hasNext);
	const [totalCount, setTotalCount] = useState(initialNotices.count);

	const currentPage = Math.floor(offset / NOTICE_LIMIT) + 1;
	const totalPages = Math.ceil(totalCount / NOTICE_LIMIT);
	const pageCount = Math.min(totalPages, 7);
	const isFirstPage = currentPage === 1;
	const isLastPage = currentPage === totalPages;

	// 모바일 크기에서 맞춤공고 2개 렌더링
	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 768) {
				setNoticesToShow(2);
			} else {
				setNoticesToShow(3);
			}
		};
		handleResize();
		window.addEventListener('resize', handleResize);

		return () => window.removeEventListener('resize', handleResize);
	}, []);

	// 로컬스토리지에서 주소값 가져와서 맞춤공고 렌더링
	useEffect(() => {
		const token = localStorage.getItem('token');
		const isLoggedIn = !!token && !!user;

		// 로그인 상태가 아닐 경우의 로직
		if (!isLoggedIn) {
			const nonLoggedInNotices = personalNotices.items
				.filter(({ item }) => !isClosed(item))
				.slice(0, noticesToShow);
			setCustomNotices(nonLoggedInNotices);
			return;
		}

		const fetchUserAddress = async () => {
			try {
				const res = await getUser(user.id, token as string);
				const address = res.item.address;

				// 사용자 주소가 있으면 해당 주소의 공고 목록 불러오기
				if (address) {
					const updatedNotices = await fetchNoticeList({
						offset: 0,
						limit: PERSONAL_NOTICE_LIMIT,
						address: `${address}`,
					});

					// 마감되지 않은 공고 필터링
					const filteredUpdatedNotices = updatedNotices.items.filter(({ item }) => !isClosed(item));

					// 필터링된 공고가 있는 경우 3개까지 보여줌
					if (filteredUpdatedNotices.length > 0) {
						const finalNotices = filteredUpdatedNotices.slice(0, noticesToShow);
						setCustomNotices(finalNotices);
					} else {
						// 사용자 주소에 맞는 공고가 없으면 기본공고 렌더링
						const fallbackNotices = personalNotices.items
							.filter(({ item }) => !isClosed(item))
							.slice(0, noticesToShow);
						setCustomNotices(fallbackNotices);
					}
				} else {
					// 사용자 주소가 없으면, 기본공고 렌더링
					const fallbackNotices = personalNotices.items
						.filter(({ item }) => !isClosed(item))
						.slice(0, noticesToShow);
					setCustomNotices(fallbackNotices);
				}
			} catch {
				const fallbackNotices = personalNotices.items
					.filter(({ item }) => !isClosed(item))
					.slice(0, noticesToShow);
				setCustomNotices(fallbackNotices);
			}
		};
		fetchUserAddress();
	}, [user, personalNotices, noticesToShow]);

	// 전체 공고 부분 렌더링 + 검색 기능
	useEffect(() => {
		const fetchNotice = async () => {
			const queryParams: NoticeQueryParams = {
				offset,
				limit: NOTICE_LIMIT,
				sort: sortOption,
			};

			if (appliedFilterState.startsAtGte.trim()) {
				queryParams.startsAtGte = formatToRFC3339(appliedFilterState.startsAtGte.trim());
			}
			if (appliedFilterState.selectedAddress) {
				queryParams.address = appliedFilterState.selectedAddress;
			}
			if (appliedFilterState.hourlyPayGte.trim()) {
				queryParams.hourlyPayGte = Number(appliedFilterState.hourlyPayGte);
			}
			if (searchQuery) {
				queryParams.keyword = searchQuery;
			}

			const data = await fetchNoticeList(queryParams);
			setNotices(data.items);
			setTotalCount(data.count);
			setHasNext(data.hasNext);
		};

		fetchNotice();
	}, [offset, sortOption, appliedFilterState, searchQuery]);

	const handleCardClick = (notice: Notice) => {
		const shopId = notice.shop?.item?.id;
		if (shopId) {
			router.push(`/posts/${shopId}/${notice.id}`);
		}
	};

	const handleApplyFilter = (newFilterState: DetailFilterState) => {
		if (newFilterState.startsAtGte.trim()) {
			const dateStr = newFilterState.startsAtGte.trim();
			if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
				setModalMessage('날짜 형식이 올바르지 않습니다.');
				openModal();
				return;
			}
		}

		setAppliedFilterState(newFilterState);
		setOffset(0);

		let count = newFilterState.selectedAddress ? 1 : 0;
		if (newFilterState.startsAtGte.trim() !== '') count += 1;
		if (newFilterState.hourlyPayGte.trim() !== '') count += 1;
		setDetailFilterCount(count);
	};

	return (
		<>
			{!searchQuery && (
				<div className={styles.fullWidthSection}>
					<div className={styles.innerContent}>
						<div className={styles.personalPostWrapper}>
							<p className={styles.title}>맞춤 공고</p>
							<div className={styles.personalPost}>
								{customNotices.map(({ item }: { item: Notice }, idx: number) => (
									<SmallNoticePoastCard
										key={idx}
										notice={item}
										onClick={() => handleCardClick(item)}
									/>
								))}
							</div>
						</div>
					</div>
				</div>
			)}

			<div className={styles.allNotices}>
				<div className={styles.allPostContainer}>
					<div className={styles.allPostWrapper}>
						<span className={styles.title}>
							{searchQuery ? (
								<>
									<span className={styles.keyword}>{searchQuery}</span>에 대한 공고 목록
								</>
							) : (
								'전체 공고'
							)}
						</span>
						<div className={styles.filterWrapper}>
							<button className={styles.filter} onClick={() => setShowFilter(prev => !prev)}>
								<p>{sortOptions.find(opt => opt.value === sortOption)?.label}</p>
								<Image
									src={`/img/icon/${showFilter ? 'arrowup' : 'arrowdown'}.svg`}
									alt="필터"
									width={13}
									height={8}
								/>
							</button>
							{showFilter && (
								<ul className={styles.dropdown}>
									{sortOptions.map(({ label, value }) => (
										<li
											key={value}
											className={styles.dropdownItem}
											onClick={() => {
												setSortOption(value as 'time' | 'pay' | 'hour' | 'shop');
												setShowFilter(false);
												setOffset(0);
											}}
										>
											{label}
										</li>
									))}
								</ul>
							)}
							<button className={styles.detailFilter} onClick={() => setShowDetailFilter(true)}>
								<p>상세 필터{detailFilterCount > 0 && ` (${detailFilterCount})`}</p>
							</button>
							{showDetailFilter && (
								<DetailFilter
									onClose={() => setShowDetailFilter(false)}
									onApply={handleApplyFilter}
									detailFilterState={detailFilterState}
									setDetailFilterState={setDetailFilterState}
								/>
							)}
							{isOpen && (
								<Confirm
									isOpen={isOpen}
									onClose={closeModal}
									message={modalMessage}
									onConfirm={closeModal}
								/>
							)}{' '}
						</div>
					</div>
					<div className={styles.allPost}>
						{notices.map(({ item }: { item: Notice }, idx: number) => {
							const closed = isClosed(item);
							return (
								<SmallNoticePoastCard
									key={idx}
									notice={{ ...item, closed }}
									onClick={() => handleCardClick(item)}
								/>
							);
						})}
					</div>

					<div className={styles.pagination}>
						<button
							disabled={isFirstPage}
							onClick={() => {
								setOffset(offset - NOTICE_LIMIT);
							}}
							className={styles.arrowButton}
						>
							<img src="/img/icon/leftIcon.svg" alt="이전페이지" width={9} height={16} />
						</button>

						{Array.from({ length: pageCount }).map((_, i) => {
							const pageNum = i + 1;
							const isActive = pageNum === currentPage;
							return (
								<button
									key={pageNum}
									onClick={() => setOffset((pageNum - 1) * NOTICE_LIMIT)}
									className={`${styles.pageButton} ${isActive ? styles.active : ''}`}
								>
									{pageNum}
								</button>
							);
						})}

						<button
							disabled={isLastPage}
							onClick={() => setOffset(offset + NOTICE_LIMIT)}
							className={styles.arrowButton}
						>
							<img src="/img/icon/rightIcon.svg" alt="다음페이지" width={9} height={16} />
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default Posts;
