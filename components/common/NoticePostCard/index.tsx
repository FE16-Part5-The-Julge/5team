import styles from './NoticePostCard.module.css';
import { NoticeItem } from '@/types/notice';
import { formatNoticeTimes } from '@/utils/dayformatting';
import TimeIcon from '@/assets/img/timeIcon.svg';
import PathIcon from '@/assets/img/pathIcon.svg';
import UpArrowIcon from '@/assets/img/upArrowIcon';

const formatNumberWithCommas = (num: number): string => {
	return num.toLocaleString('ko-KR');
};

interface NoticePostCardProps {
	notice: NoticeItem;
	children?: React.ReactNode;
}

const NoticePostCard = ({ notice, children }: NoticePostCardProps) => {
	const timeText = formatNoticeTimes(notice);
	// 시급 계산
	const hourlyPay = notice?.hourlyPay;
	const originalPay = notice?.shop?.item?.originalHourlyPay;
	const percentIncrease =
		hourlyPay && originalPay ? Math.round(((hourlyPay - originalPay) / originalPay) * 100) : null;

	return (
		<div className={styles.container}>
			<span className={styles.category}>{notice?.shop?.item?.category}</span>
			<h2 className={styles.shopName}>{notice?.shop?.item?.name}</h2>
			<ul className={styles.JopPostCard}>
				<li className={styles.imageUrl}>
					<div className={styles.imageWrapper}>
						<img src={notice.shop.item.imageUrl} alt={notice.shop.item.name} />
					</div>
				</li>
				<div className={styles.responsiveDesign}>
					<li className={styles.category}>시급</li>
					<li className={styles.houlyPay}>
						{hourlyPay ? formatNumberWithCommas(hourlyPay) : 0}원
						{typeof percentIncrease === 'number' && percentIncrease > 0 && (
							<span className={styles.houlyPayBadge}>
								기존 시급보다 {percentIncrease}%
								<UpArrowIcon color="#ffffff" />
							</span>
						)}
					</li>
					<li className={styles.startsAt}>
						<TimeIcon witdh={16} height={16} />
						{timeText}
					</li>
					<li className={styles.address1}>
						<PathIcon witdh={16} height={16} />
						{notice?.shop?.item?.address1}
					</li>
					<li className={styles.description}>{notice?.shop?.item?.description}</li>
					<div className={styles.responsiveDesignButton}>
						<li className={styles.editButton}>{children}</li>
					</div>
				</div>
			</ul>
			<div className={styles.descriptionContainer}>
				<label className={styles.noticeLabel}>공고 설명</label>
				<p className={styles.noticeDescription}>{notice?.description}</p>
			</div>
		</div>
	);
};

export default NoticePostCard;

// 사용처마다 버튼 갯수와 스타일 달라 children 사용
