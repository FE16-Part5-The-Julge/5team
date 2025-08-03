import React, { useState, useRef, useEffect } from 'react';
import styles from './DropdownInput.module.css';
import Image from 'next/image';

import { DROPDOWN_OPTIONS_MAP } from '@/constants/DropdownOptions';
import { BaseInput } from '../_base/BaseInput';
import { InputCore } from '../_base/InputCore';

interface DropdownInputProps {
	id: string;
	label: string;
	value: string;
	onSelectOption: (value: string) => void;
	error?: string; // 에러 메시지
	width?: string;
	required?: boolean;
	options?: string[];
	className?: string;
	placeholder?: string;
	onClick?: React.MouseEventHandler<HTMLInputElement>;
}

export const DropdownInput = ({
	id,
	label,
	error,
	width = '100%',
	required = false,
	options: externalOptions = [], // 외부에서 넘겨받는 옵션들
	onSelectOption,
	value,
	className,
	...props
}: DropdownInputProps) => {
	const [showOptions, setShowOptions] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// label에 따라 자동으로 옵션 데이터 가져오기
	const autoOptions = label && DROPDOWN_OPTIONS_MAP[label] ? DROPDOWN_OPTIONS_MAP[label] : [];
	// 최종적으로 사용할 옵션: 외부 옵션이 있으면 그것을, 없으면 label에 따른 자동 옵션을 사용
	const finalOptions = externalOptions.length > 0 ? externalOptions : autoOptions;

	// 외부 클릭 시 드롭다운 닫기
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setShowOptions(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
		if (props.onClick) {
			props.onClick(e);
		}
		setShowOptions(!showOptions);
	};

	const handleOptionClick = (option: string) => {
		if (onSelectOption) {
			onSelectOption(option);
		}
		setShowOptions(false);
	};

	return (
		<div className={styles.dropdownInputContainer} ref={dropdownRef}>
			<BaseInput id={id} label={label} error={error} width={width} required={required}>
				<InputCore
					id={id}
					value={value || ''}
					readOnly={true}
					onClick={handleInputClick}
					className={className}
					error={!!error}
					{...props}
				/>
				<span className={styles.dropdownArrow} onClick={handleInputClick}>
					{showOptions ? (
						<Image src="/img/icon/arrowup.svg" alt="닫기" width={13} height={8} />
					) : (
						<Image src="/img/icon/arrowdown.svg" alt="열기" width={13} height={8} />
					)}
				</span>
			</BaseInput>

			{showOptions && (
				<ul className={styles.dropdownList}>
					{finalOptions.map((option, index) => (
						<li key={index} onClick={() => handleOptionClick(option)}>
							{option}
						</li>
					))}
				</ul>
			)}
		</div>
	);
};
