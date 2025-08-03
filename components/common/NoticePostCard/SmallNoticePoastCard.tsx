import styles from './SmallNoticePostCard.module.css';
import { NoticeItem } from '@/types';
import { formatNoticeTimes } from '@/utils/dayformatting';
import TimeIcon from '@/assets/img/timeIcon.svg';
import PathIcon from '@/assets/img/pathIcon.svg';
import UpArrowIcon from '@/assets/img/upArrowIcon';

type Props = {
	notice: NoticeItem;
	onClick: () => void;
};

const SmallNoticePoastCard = ({ notice, onClick }: Props) => {
	const isClosed = notice.closed;
	const timeText = formatNoticeTimes(notice);

	// 시급 계산
	const hourlyPay = notice?.hourlyPay;
	const originalPay = notice?.shop?.item?.originalHourlyPay;
	const percentIncrease =
		hourlyPay && originalPay ? Math.round(((hourlyPay - originalPay) / originalPay) * 100) : null;

	return (
		<div onClick={onClick} className={`${styles.container} ${isClosed ? styles.closed : ''}`}>
			<ul className={styles.JobPostCard}>
				<li className={styles.imageUrl}>
					<div className={styles.imageWrapper}>
						<img src={notice.shop.item.imageUrl} alt={notice.shop.item.name} />
						{isClosed && <div className={styles.overlay}>마감 완료</div>}
					</div>
				</li>
				<li className={styles.shopName}>{notice?.shop?.item?.name}</li>
				<li className={styles.startsAt}>
					<TimeIcon width={16} height={16} />
					{timeText}
				</li>
				<li className={styles.address1}>
					<PathIcon width={16} height={16} />
					{notice?.shop?.item?.address1}
				</li>
				<div className={styles.responsiveDesign}>
					<li className={styles.houlyPay}>{notice?.hourlyPay.toLocaleString()}원</li>
					{!isClosed && (
						<li className={styles.houlyPayBadge}>
							기존 시급보다 {percentIncrease}%
							<UpArrowIcon className={styles.upArrowIcon} />
						</li>
					)}
				</div>
			</ul>
		</div>
	);
};

export default SmallNoticePoastCard;
