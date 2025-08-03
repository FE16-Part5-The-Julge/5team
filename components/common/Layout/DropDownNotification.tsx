import React, { useState, useEffect } from 'react';

import Notification from '@/assets/img/notification.svg';
import styles from './DropDownNotification.module.css';
import NotificationCard from '@/components/Modal/Notification/Notification';
import dayjs from 'dayjs';

import { useUserContext } from '@/contexts/auth-context';
import { getUserAlerts } from '@/api/applications/getUserAlerts';

export default function DropDownMenu() {
	const [dropdownVisible, setDropdownVisible] = useState(false); //visible 상태
	const { user } = useUserContext();
	const [userAlertData, setUserAlertData] = useState([]);

	function createAtFormDate(dateData: string) {
		const createDate = dayjs(dateData);
		const createFormat = createDate.format('YYYY-MM-DD');
		return createFormat;
	}

	function createAtFormTime(timeData: string) {
		const createTime = dayjs(timeData);
		const createFormat = createTime.format('HH:mm');
		return createFormat;
	}

	function statusFunc(statusprop: string) {
		switch (statusprop) {
			case 'pending':
				return '대기중';
			case 'accepted':
				return '승인';
			case 'rejected':
				return '거절';
			default:
				return '거절';
		}
	}

	function agoCalcFunc(startParam: string) {
		const now = new Date();
		const past = new Date(startParam);

		const diffMs = now.getTime() - past.getTime(); // 밀리초 차이
		const diffSec = Math.floor(diffMs / 1000);
		const diffMin = Math.floor(diffSec / 60);
		const diffHours = Math.floor(diffMin / 60);
		const diffDays = Math.floor(diffHours / 24);

		if (diffDays > 0) {
			return `${diffDays}일 전`;
		} else if (diffHours > 0) {
			return `${diffHours}시간 전`;
		} else if (diffMin > 0) {
			return `${diffMin}분 전`;
		} else {
			return `방금 전`;
		}
	}
	useEffect(() => {
		const userToken = localStorage.getItem('token');
		if (!user?.id || !userToken) return;
		console.log(`userID : ${user.id}, userToken : ${userToken}`);
		const getData = async () => {
			try {
				// getUser 함수 호출

				const res = await getUserAlerts(user.id, userToken);

				console.log(res.items);
				console.log('fdfd');

				const mapped = res.items.map((i: any) => {
					const createdDate = createAtFormDate(i.item.notice.item.startsAt);
					const createdTime = createAtFormTime(i.item.notice.item.startsAt);
					const statusValue = statusFunc(i.item.status);
					const agoCalc = agoCalcFunc(i.item.createdAt);
					return {
						id: i.item.id,
						store: i.item.shop.item.name,
						date: createdDate,
						time: createdTime,
						status: statusValue,
						ago: agoCalc,
					};
				});
				console.log(mapped);

				setUserAlertData(mapped);
			} catch (err) {
				console.error(err);
			} finally {
			}
		};
		getData();
	}, [user]);

	const toggleDropdown = () => {
		setDropdownVisible(prev => !prev);
	};

	return (
		<>
			<button className={styles.notification} onClick={toggleDropdown}>
				<Notification id={styles.icon} />
			</button>

			{dropdownVisible && (
				<NotificationCard notifications={userAlertData} onClose={toggleDropdown} />
			)}
		</>
	);
}
