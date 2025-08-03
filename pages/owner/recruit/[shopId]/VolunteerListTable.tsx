import React, { useEffect, useState, useMemo } from 'react';
import {
	useReactTable,
	getCoreRowModel,
	flexRender,
	getPaginationRowModel,
} from '@tanstack/react-table';
import styles from './VolunteerListTable.module.css';
import axiosInstance from '@/api/settings/axiosInstance';

// 새로 만든 ActionCell 컴포넌트를 import 합니다.
import ActionCell from './ActionCell';

interface Applicant {
	id: string;
	applyId: string;
	name?: string;
	phone?: string;
	bio?: string;
	status: 'pending' | 'accepted' | 'rejected' | 'canceled';
}

interface VolunteerListTableProps {
	shopId: string;
	noticeId: string;
}

// 컬럼 정의 함수가 상태 업데이트 핸들러를 받도록 수정합니다.
const baseColumns = (
	shopId: string,
	noticeId: string,
	onStatusUpdate: (applyId: string, newStatus: 'accepted' | 'rejected') => void
) => [
	{
		accessorKey: 'name',
		header: '신청자',
		meta: { responsive: 'mobile' },
		cell: (info: any) => info.getValue(),
	},
	{
		accessorKey: 'bio',
		header: '소개',
		meta: { responsive: 'tablet' },
		cell: (info: any) => info.getValue() || '-',
	},
	{
		accessorKey: 'phone',
		header: '전화번호',
		meta: { responsive: 'desktop' },
		cell: (info: any) => info.getValue() || '-',
	},
	{
		id: 'actions',
		header: '상태',
		meta: { responsive: 'mobile' },
		// cell 렌더러가 ActionCell 컴포넌트를 렌더링하도록 수정합니다.
		cell: ({ row }: any) => {
			const { applyId, status } = row.original;
			return (
				<ActionCell
					shopId={shopId}
					noticeId={noticeId}
					applyId={applyId}
					initialStatus={status}
					onStatusUpdate={onStatusUpdate} // 상태 업데이트 함수를 prop으로 전달
				/>
			);
		},
	},
];

async function fetchApplicants(shopId: string, noticeId: string, offset: number, limit: number) {
	const res = await axiosInstance.get(`shops/${shopId}/notices/${noticeId}/applications`, {
		params: { offset, limit },
	});
	return res.data;
}

function useDeviceType(): 'mobile' | 'tablet' | 'desktop' {
	const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

	useEffect(() => {
		const handleResize = () => {
			const width = window.innerWidth;
			if (width <= 768) setDeviceType('mobile');
			else if (width <= 1024) setDeviceType('tablet');
			else setDeviceType('desktop');
		};
		handleResize();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return deviceType;
}

const VolunteerListTable = ({ shopId, noticeId }: VolunteerListTableProps) => {
	const [applications, setApplicants] = useState<Applicant[]>([]);
	const [offset, setOffset] = useState(0);
	const [hasNext, setHasNext] = useState(false);
	const limit = 5;
	const deviceType = useDeviceType();

	// 자식(ActionCell)이 호출하여 부모의 상태(applications)를 업데이트할 함수
	const handleStatusUpdate = (applyId: string, newStatus: 'accepted' | 'rejected') => {
		setApplicants(currentApplicants =>
			currentApplicants.map(app => (app.applyId === applyId ? { ...app, status: newStatus } : app))
		);
	};

	// useMemo를 사용하여 컬럼을 정의할 때, 핸들러 함수를 넘겨줍니다.
	const columns = useMemo(
		() => baseColumns(shopId, noticeId, handleStatusUpdate),
		[shopId, noticeId] // shopId, noticeId가 변경될 때만 컬럼을 새로 생성
	);

	const filteredColumns = useMemo(() => {
		return columns.filter(col => {
			const responsive = (col.meta as any)?.responsive ?? 'desktop';
			if (deviceType === 'mobile') return ['mobile'].includes(responsive);
			if (deviceType === 'tablet') return ['mobile', 'tablet'].includes(responsive);
			return true;
		});
	}, [deviceType, columns]);

	useEffect(() => {
		if (!shopId || !noticeId) return;

		const loadApplicants = async () => {
			try {
				const res = await fetchApplicants(shopId, noticeId, offset, limit);
				if (!res.items) {
					setApplicants([]); // 데이터가 없을 경우 빈 배열로 초기화
					setHasNext(false);
					return;
				}
				const mapped = res.items.map((application: any) => {
					const user = application.item.user?.item;
					return {
						id: application.item.id,
						applyId: application.item.id,
						name: user?.name ?? '익명의 지원자',
						phone: user?.phone ?? '연락처 없음',
						bio: user?.bio ?? '자기소개 없음',
						status: application.item.status,
						createdAt: application.item.createdAt,
					};
				});
				setApplicants(mapped);
				setHasNext(res.hasNext);
			} catch (error) {
				console.error('지원자 목록 불러오기 실패', error);
				// 에러 발생 시 사용자에게 알림을 주는 것이 좋습니다.
				alert('지원자 목록을 불러오는 중 오류가 발생했습니다.');
			}
		};
		loadApplicants();
	}, [shopId, noticeId, offset]);

	const table = useReactTable({
		data: applications,
		columns: filteredColumns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		// 페이지네이션 상태를 react-table 내부에서 관리하지 않으므로 initialState 제거
	});

	return (
		<div className={styles.container}>
			<table className={styles.table}>
				<thead>
					{table.getHeaderGroups().map(headerGroup => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map(header => (
								<th key={header.id}>
									{header.isPlaceholder
										? null
										: flexRender(header.column.columnDef.header, header.getContext())}
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody>
					{/* 페이지네이션을 직접 관리하므로 getRowModel()을 사용합니다. */}
					{table.getRowModel().rows.map(row => (
						<tr key={row.id}>
							{row.getVisibleCells().map(cell => (
								<td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
							))}
						</tr>
					))}
				</tbody>
			</table>

			<div className={styles.pagination}>
				<button
					onClick={() => setOffset(prev => Math.max(0, prev - limit))}
					disabled={offset === 0}
				>
					&lt;
				</button>
				{Array.from({ length: Math.ceil(applications.length / limit) }, (_, i) => (
					<button
						key={i}
						onClick={() => setOffset(i * limit)}
						className={offset / limit === i ? styles.active : ''}
					>
						{i + 1}
					</button>
				))}
				<button onClick={() => setOffset(prev => prev + limit)} disabled={!hasNext}>
					&gt;
				</button>
			</div>
		</div>
	);
};

export default VolunteerListTable;
