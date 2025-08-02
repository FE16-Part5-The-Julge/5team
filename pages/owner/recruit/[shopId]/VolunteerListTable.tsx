import React, { useEffect, useState, useMemo } from 'react';
import {
	useReactTable,
	getCoreRowModel,
	flexRender,
	getPaginationRowModel,
} from '@tanstack/react-table';
import styles from './VolunteerListTable.module.css';
import axiosInstance from '@/api/settings/axiosInstance';
import { updateApplication } from '@/api/applications/updateApplication';

interface Applicant {
	id: string;
	applyid: string;
	name?: string;
	phone?: string;
	bio?: string;
	status: string;
	createdAt: string;
}

interface VolunteerListTableProps {
	shopId: string;
	noticeId: string;
}

// Static column definitions moved outside the component
const baseColumns = (shopId: string, noticeId: string) => [
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
		cell: ({ row }: any) => {
			const { applyid, status } = row.original;
			const [loading, setLoading] = useState(false);
			const [localStatus, setLocalStatus] = useState(status);

			const onClickStatusChange = async (newStatus: 'accepted' | 'rejected') => {
				setLoading(true);
				try {
					await updateApplication(shopId, noticeId, applyid, newStatus);
					setLocalStatus(newStatus);
				} catch (e) {
					alert('상태 변경 실패: ' + e);
				} finally {
					setLoading(false);
				}
			};

			if (localStatus === 'accepted') {
				return <span className={styles.statusAccepted}>승인완료</span>;
			}
			if (localStatus === 'rejected') {
				return <span className={styles.statusRejected}>거절됨</span>;
			}

			return (
				<div className={styles.actions}>
					<button
						className={styles.refuse}
						disabled={loading}
						onClick={() => onClickStatusChange('rejected')}
					>
						거절하기
					</button>
					<button
						className={styles.admit}
						disabled={loading}
						onClick={() => onClickStatusChange('accepted')}
					>
						승인하기
					</button>
				</div>
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

	const columns = useMemo(() => baseColumns(shopId, noticeId), [shopId, noticeId]);

	const filteredColumns = useMemo(() => {
		return columns.filter(col => {
			const responsive = col.meta?.responsive ?? 'desktop';
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
					return;
				}
				const mapped = res.items.map((application: any) => {
					const user = application.item.user?.item;
					return {
						id: application.item.id,
						applyid: application.id,
						name: user?.name ?? '익명의 지원자',
						phone: user?.phone ?? '연락처 없음',
						bio: user?.bio ?? '자기소개 없음',
						status: application.item.status,
						createdAt: application.item.createdAt,
						shopId,
						noticeId,
					};
				});
				setApplicants(mapped);
				setHasNext(res.hasNext);
			} catch (error) {
				console.log('지원자 목록 불러오기 실패', error);
			}
		};
		loadApplicants();
	}, [shopId, noticeId, offset]);

	const table = useReactTable({
		data: applications,
		columns: filteredColumns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		initialState: {
			pagination: {
				pageSize: 5,
			},
		},
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
					{table.getPaginationRowModel().rows.map(row => (
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
				<button onClick={() => setOffset(prev => prev + limit)} disabled={!hasNext}>
					&gt;
				</button>
			</div>
		</div>
	);
};

export default VolunteerListTable;
