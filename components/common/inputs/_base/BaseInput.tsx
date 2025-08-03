import React, { isValidElement, ReactElement, ReactNode } from 'react';
import styles from './BaseInput.module.css';

interface BaseInputProps {
	id: string;
	label: string;
	error?: string; // 폼에서 전달
	width?: string;
	required?: boolean;
	children: ReactNode;
}

interface ChildInputProps {
	error?: boolean;
	id?: string;
	className?: string;
}

export const BaseInput = ({
	id,
	label,
	error,
	width = '100%',
	required = false,
	children,
}: BaseInputProps) => {
	const cloneChildren = React.Children.map(children, child => {
		if (isValidElement(child)) {
			return React.cloneElement(child as ReactElement<ChildInputProps>, {
				id,
				error: error ? true : undefined,
			});
		}
		return child;
	});

	return (
		<div className={styles.inputContainer} style={{ width }}>
			{label && (
				<label htmlFor={id} className={styles.label}>
					{label}
					{required && <span className={styles.requiredIndicator}>*</span>}
				</label>
			)}
			<div className={styles.inputWrapper}>{cloneChildren}</div>
			{error && (
				<p id={`${id}-error`} className={styles.errorMessage} role="alert">
					{error}
				</p>
			)}
		</div>
	);
};
