import React, { useRef, useState } from 'react';
import styles from './ImageUpload.module.css';
import CameraIcon from '@/assets/img/camera.svg';
import { getPresignedUrl, uploadToS3 } from '@/api/imageRequest';
import useModal from '@/hooks/useModal';
import Confirm from '@/components/Modal/Confirm/Confirm';
import Image from 'next/image';

interface ImageUploadProps {
	value?: string;
	onChange: (file: File | null, uploadedUrl?: string) => void;
	placeholder?: string;
	className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
	value,
	onChange,
	placeholder,
	className = '',
}) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [preview, setPreview] = useState<string | undefined>(undefined);
	const errorModal = useModal();
	const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
	const handleClick = () => {
		inputRef.current?.click();
	};

	const uploadImage = async (image: File) => {
		let presignedUrl: string | undefined;
		try {
			const name = `${new Date().toISOString().replace(/[:.]/g, '-')}_${image.name}`;
			presignedUrl = await getPresignedUrl(name);
		} catch {
			return { error: 'presignedUrl을 가져오는데 실패했습니다.' };
		}
		try {
			await uploadToS3(presignedUrl, image);
		} catch {
			return { error: 'S3 업로드에 실패했습니다.' };
		}
		return { success: true, url: presignedUrl.split('?')[0] };
	};

	const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;

		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				const previewUrl = reader.result as string;
				setPreview(previewUrl);
			};
			reader.readAsDataURL(file);

			const result = await uploadImage(file);
			if (result.error) {
				setErrorMessage(result.error);
				errorModal.openModal();
				setPreview(undefined);
				onChange(null, undefined);
				return;
			}
			onChange(file, result.url);
		}
	};

	return (
		<div className={`${styles.imageUpload} ${className}`} onClick={handleClick}>
			<input
				ref={inputRef}
				type="file"
				accept="image/*"
				style={{ display: 'none' }}
				onChange={handleChange}
			/>
			{(preview && preview.length > 0) || value ? (
				<Image
					className={styles.image}
					src={preview || value || ''}
					alt="미리보기"
					fill
					priority
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					style={{ objectFit: 'cover' }}
				/>
			) : (
				<div className={styles.container}>
					<div className={styles.cameraIcon}>
						<CameraIcon alt="이미지 추가하기" />
					</div>
					<div className={styles.placeholder}>{placeholder || '이미지 추가하기'}</div>
				</div>
			)}
			{errorModal.renderModal(Confirm, {
				message: errorMessage,
				onConfirm: errorModal.closeModal,
			})}
		</div>
	);
};

export default ImageUpload;
