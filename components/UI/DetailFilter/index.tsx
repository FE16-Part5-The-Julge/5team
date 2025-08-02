import Image from 'next/image';
import { Dispatch, SetStateAction } from 'react';
import styles from './DetailFilter.module.css';
import buttonStyles from '@/components/common/BaseButton/BaseButton.module.css';

import { TextInput } from '@/components/common/inputs/TextInput';
import { NumberInput } from '@/components/common/inputs/NumberInput';
import { DROPDOWN_OPTIONS_MAP } from '@/constants/DropdownOptions';

interface DetailFilterState {
	startsAtGte: string;
	hourlyPayGte: string;
	selectedAddress: string | null;
}

interface DetailFilterProps {
	onClose: () => void;
	onApply: (newFilterState: DetailFilterState) => void;
	detailFilterState: DetailFilterState;
	setDetailFilterState: Dispatch<SetStateAction<DetailFilterState>>;
}

const DetailFilter = ({
	onClose,
	onApply,
	detailFilterState,
	setDetailFilterState,
}: DetailFilterProps) => {
	const { startsAtGte, hourlyPayGte, selectedAddress } = detailFilterState;
	const options = DROPDOWN_OPTIONS_MAP['주소'];

	const handleAddressClick = (address: string) => {
		// 기존 주소와 같으면 null로 초기화, 다르면 새로 선택
		setDetailFilterState(prev => ({
			...prev,
			selectedAddress: prev.selectedAddress === address ? null : address,
		}));
	};

	const handleRemoveAddress = () => {
		setDetailFilterState(prev => ({
			...prev,
			selectedAddress: null,
		}));
	};

	const handleReset = () => {
		setDetailFilterState({ startsAtGte: '', hourlyPayGte: '', selectedAddress: null });
	};

	const handleApply = () => {
		let count = selectedAddress ? 1 : 0;
		if (startsAtGte.trim() !== '') count += 1;
		if (hourlyPayGte.trim() !== '') count += 1;

		onApply(detailFilterState);
		onClose();
	};

	return (
		<div className={styles.container}>
			<div className={styles.withoutButtons}>
				<div className={styles.titleWrapper}>
					<span className={styles.title}>상세 필터</span>
					<Image
						src="/img/icon/closeIcon.svg"
						alt="상세필터 닫기"
						width={24}
						height={24}
						onClick={onClose}
						style={{ cursor: 'pointer' }}
					/>
				</div>
				<div className={styles.gap2x}>
					<div className={styles.gap}>
						<span className={styles.secTitle}>위치</span>
						<div className={styles.scroller}>
							<ul>
								{options.map((item, idx) => (
									<li key={idx} onClick={() => handleAddressClick(item)}>
										{item}
									</li>
								))}
							</ul>
						</div>

						<div className={styles.selected}>
							{selectedAddress && (
								<div className={styles.selectedItem}>
									<span>{selectedAddress}</span>
									<div className={styles.close} onClick={handleRemoveAddress}>
										<Image
											src="/img/icon/closeIcon.svg"
											alt="주소선택 취소"
											width={20}
											height={20}
										/>
									</div>
								</div>
							)}
						</div>
					</div>

					<div className={styles.devider}></div>
					<div className={styles.gap2x}>
						<TextInput
							id="startAtGte"
							label="시작일"
							value={startsAtGte}
							onChange={e =>
								setDetailFilterState(prev => ({ ...prev, startsAtGte: e.target.value }))
							}
							placeholder="2025-01-01"
						/>
					</div>
					<div className={styles.devider}></div>
					<div className={styles.payWrapper}>
						<div className={styles.pay}>
							<NumberInput
								id="hourlyPayGte"
								label="금액"
								value={hourlyPayGte}
								onChange={value => setDetailFilterState(prev => ({ ...prev, hourlyPayGte: value }))}
								placeholder="10000"
								unitText="원"
							/>
						</div>
						<span className={styles.unit}>이상부터</span>
					</div>
				</div>
			</div>
			<div className={styles.buttons}>
				<button className={`${buttonStyles.white} ${styles.reset}`} onClick={handleReset}>
					초기화
				</button>
				<button className={`${buttonStyles.red} ${styles.confirm}`} onClick={handleApply}>
					적용하기
				</button>
			</div>
		</div>
	);
};

export default DetailFilter;
