import styles from './create.module.css';

import { TextInput } from '@/components/common/inputs/TextInput';
import { NumberInput } from '@/components/common/inputs/NumberInput';
import { useEffect, useState } from 'react';
import { TextareaInput } from '@/components/common/inputs/TextareaInput';
import CloseIcon from '@/assets/img/closeIcon.svg';
import { BaseButton } from '@/components/common/BaseButton';
import { getShopId } from '@/api/getShopId';
import { useUserContext } from '@/contexts/auth-context';
import { createNotice } from '@/api/createNotice';
import Alert from '@/components/Modal/Alert/Alert';
import { useRouter } from 'next/router';

export default function CreateNotice() {
	const router = useRouter();
	const [isAlertOpen, setIsAlertOpen] = useState(false);
	const [createdNotice, setCreatedNotice] = useState<null | {
		id: string;
		shopId: string;
	}>(null);
	const { user } = useUserContext();
	const [shopId, setShopId] = useState<string | null>(null);
	const [form, setForm] = useState({
		hourlypay: '',
		startsAt: '',
		workhour: '',
		description: '',
	});

	useEffect(() => {
		const fetchShop = async () => {
			if (!user?.id) return;
			try {
				const { item } = await getShopId(user.id);
				setShopId(item.id);
			} catch (err) {
				console.error('shop 정보 불러오기 실패', err);
			}
		};

		fetchShop();
	}, [user]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const key = e.target.id; // id를 key로 사용
		setForm(prev => ({
			...prev,
			[key]: e.target.value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!shopId) {
			alert('shop 정보를 불러오지 못했습니다.');
			return;
		}

		const token = localStorage.getItem('token');

		if (!token) {
			alert('인증 정보가 없습니다.');
			return;
		}

		try {
			const res = await createNotice({
				...form,
				shopId,
				token,
			});
			// API 성공 후 생성된 공고 저장
			setCreatedNotice({
				id: res.item.id,
				shopId: res.item.shop.item.id,
			});

			// 모달 열기
			setIsAlertOpen(true);

			// 성공 처리
		} catch (err) {
			console.error('공고 등록 실패', err);
		}
	};

	// Alert 모달에서 확인 클릭시
	const handleConfirm = () => {
		if (!createdNotice) return;
		setIsAlertOpen(false);
		router.push(`/owner/recruit/${createdNotice.shopId}/${createdNotice.id}`);
	};

	// Alert 모달 닫기 클릭시 (취소 등)
	const handleClose = () => {
		setIsAlertOpen(false);
	};

	return (
		<>
			<h2 className={styles.title}>
				공고 등록 <CloseIcon />
			</h2>
			<form className={styles.form} onSubmit={handleSubmit}>
				<NumberInput
					id="hourlypay"
					label="시급"
					value={form.hourlypay}
					onChange={value =>
						setForm(prev => ({
							...prev,
							hourlypay: value,
						}))
					}
					placeholder="10000"
					required
					unitText="원"
					error={!form.hourlypay ? '시급을 입력해주세요' : ''}
				/>

				<TextInput
					id="startsAt"
					label="시작 일시"
					value={form.startsAt}
					onChange={handleChange}
					placeholder="2023-12-23T00:00:00Z"
				/>

				<NumberInput
					id="workhour"
					label="업무 시간"
					value={form.workhour}
					onChange={value =>
						setForm(prev => ({
							...prev,
							workhour: value,
						}))
					}
					placeholder="3"
					required
					unitText="시간"
					error={!form.workhour ? '시간을 입력해주세요' : ''}
				/>

				<TextareaInput
					id="description"
					label="공고 설명"
					value={form.description}
					onChange={handleChange}
				/>

				<BaseButton type="submit" color="red" size="noneSize" className={styles.myCustomButton}>
					등록하기
				</BaseButton>

				<Alert
					isOpen={isAlertOpen}
					message="등록이 완료되었습니다."
					onConfirm={handleConfirm}
					onClose={handleClose}
				/>
			</form>
		</>
	);
}
