import styles from './create.edit.module.css';
import buttonStyles from '@/components/common/BaseButton/BaseButton.module.css';
import { useForm, Controller } from 'react-hook-form';
import { TextInput } from '@/components/common/inputs/TextInput';
import { DropdownInput } from '@/components/common/inputs/DropdownInput';
import { NumberInput } from '@/components/common/inputs/NumberInput';
import { ImageInput } from '@/components/common/inputs/ImageInput';
import { TextareaInput } from '@/components/common/inputs/TextareaInput';
import { useState, useEffect } from 'react';
import { editShop } from '@/api/saveShop';
import useModal from '@/hooks/useModal';
import Alert from '@/components/Modal/Alert/Alert';
import Confirm from '@/components/Modal/Confirm/Confirm';
import { useRouter } from 'next/router';
import { Shop } from '@/types/shop';
import { useUserContext } from '@/contexts/auth-context';
import Image from 'next/image';

interface FormInputs {
	name: string;
	category: string;
	address1: string;
	address2: string;
	description: string;
	imageUrl: string;
	originalHourlyPay: number;
}

const Edit = () => {
	const { user } = useUserContext();
	const resultModal = useModal();
	const errorModal = useModal();
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const router = useRouter();
	const [myShop, setMyShop] = useState<Shop | null>(null);
	const [shopId, setShopId] = useState<string | null>(null);

	useEffect(() => {
		if (user && user.shop) {
			setMyShop(user.shop.item);
			setShopId(user.shop.item.id);
		}
	}, [user]);

	const {
		handleSubmit,
		control,
		formState: { isValid, isDirty },
		reset,
	} = useForm<FormInputs>({
		mode: 'onChange',
		defaultValues: {
			name: '',
			category: '',
			address1: '',
			address2: '',
			description: '',
			imageUrl: '',
			originalHourlyPay: 0,
		},
	});

	useEffect(() => {
		if (myShop) {
			reset({
				name: myShop.name ?? '',
				category: myShop.category ?? '',
				address1: myShop.address1 ?? '',
				address2: myShop.address2 ?? '',
				description: myShop.description ?? '',
				imageUrl: myShop.imageUrl ?? '',
				originalHourlyPay: myShop.originalHourlyPay ?? 0,
			});
		}
	}, [myShop, reset]);

	const onSubmit = async (data: FormInputs) => {
		setIsSubmitting(true);
		try {
			const shopData = { ...data };
			await editShop(shopData, shopId);
			resultModal.openModal();
		} catch (error: unknown) {
			const err = error as { status: number; message: string };
			if (err.status === 401 || err.status === 403 || err.status === 404) {
				setErrorMessage(err.message);
				errorModal.openModal();
			} else {
				setErrorMessage(`알 수 없는 오류가 발생했습니다.\n error: ${err.status}`);
				errorModal.openModal();
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<h1 className={styles.title}>가게 정보</h1>
				<button onClick={() => router.back()}>
					<Image src="/img/icon/closeIcon.svg" alt="가게 편집 닫기" width={32} height={32} />
				</button>
			</div>
			<form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
				<div className={styles.formSection}>
					<div className={styles.formRow}>
						<Controller
							name="name"
							control={control}
							rules={{ required: true }}
							render={({ field }) => (
								<TextInput
									{...field}
									id="name"
									value={field.value ?? ''}
									label="가게 이름"
									placeholder="입력"
									required={true}
								/>
							)}
						/>
						<Controller
							name="category"
							control={control}
							rules={{ required: true }}
							render={({ field }) => (
								<DropdownInput
									{...field}
									id="category"
									value={field.value ?? ''}
									label="분류"
									onSelectOption={value => {
										field.onChange(value);
									}}
									placeholder="선택"
									required={true}
								/>
							)}
						/>
					</div>
					<div className={styles.formRow}>
						<Controller
							name="address1"
							control={control}
							rules={{ required: true }}
							render={({ field }) => (
								<DropdownInput
									{...field}
									id="address1"
									label="주소"
									value={field.value ?? ''}
									onSelectOption={value => {
										field.onChange(value);
									}}
									placeholder="선택"
									required={true}
								/>
							)}
						/>
						<Controller
							name="address2"
							control={control}
							rules={{ required: true }}
							render={({ field }) => (
								<TextInput
									{...field}
									id="address2"
									value={field.value ?? ''}
									label="상세 주소"
									placeholder="입력"
									required={true}
								/>
							)}
						/>
					</div>
					<Controller
						name="originalHourlyPay"
						control={control}
						rules={{ required: true }}
						render={({ field }) => (
							<NumberInput
								{...field}
								id="originalHourlyPay"
								value={field.value?.toString() ?? ''}
								label="기본 시급"
								placeholder="입력"
								required={true}
								unitText="원"
							/>
						)}
					/>
					<Controller
						name="imageUrl"
						control={control}
						rules={{ required: true }}
						render={({ field }) => (
							<ImageInput
								{...field}
								id="imageUrl"
								value={field.value ?? ''}
								onChange={field.onChange}
								label="가게 이미지"
								placeholder="이미지 추가하기"
								required={true}
							/>
						)}
					/>
					<Controller
						name="description"
						control={control}
						rules={{ required: true }}
						render={({ field }) => (
							<TextareaInput
								{...field}
								id="description"
								value={field.value ?? ''}
								label="가게 설명"
								placeholder="입력"
								required={true}
							/>
						)}
					/>
				</div>
				<button
					type="submit"
					className={`${styles.button} ${buttonStyles.button} ${buttonStyles.red} ${
						isSubmitting || !isValid || !isDirty ? buttonStyles.disabled : ''
					}`}
					disabled={isSubmitting || !isValid || !isDirty}
				>
					완료하기
				</button>
			</form>
			{resultModal.renderModal(Alert, {
				message: '수정이 완료되었습니다.',
				onConfirm: () => {
					resultModal.closeModal();
					router.push(`/owner/store`);
				},
			})}
			{errorModal.renderModal(Confirm, {
				message: errorMessage,
				onConfirm: errorModal.closeModal,
			})}
		</div>
	);
};

export default Edit;
