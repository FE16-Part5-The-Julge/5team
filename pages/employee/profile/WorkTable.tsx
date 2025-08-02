import { useEffect, useState } from 'react';
import {
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	flexRender,
	ColumnDef,
} from '@tanstack/react-table';
import styles from './WorkTable.module.css';
import dayjs from 'dayjs';

type WorkItem = {
	store: string;
	date: string;
	wage: string;
	status: '승인 완료' | '거절' | '대기중';
};

//테이블에 들어갈 한 줄 타입
// 가게이름, 일자 , 시급, 상태

function useDeviceType(): 'mobile' | 'tablet' | 'desktop' {
	const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

	useEffect(() => {
		const handleResize = () => {
			const width = window.innerWidth;
			if (width <= 640) setDeviceType('mobile');
			else if (width <= 1024) setDeviceType('tablet');
			else setDeviceType('desktop');
		};

		handleResize(); // 처음에 한 번 실행
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return deviceType;
}
//브라우저 창 너비에 따라 디바이스 타입 구분

//전체 컬럼 정의
// 각 컬럼마다 meta.responsive를 추가하여 어느 디바이스에서 보일지 지정함
const baseColumns: any[] = [
	{
		accessorKey: 'store',
		header: '가게',
		meta: { responsive: 'mobile' },
	},
	{
		accessorKey: 'date',
		header: '일자',
		meta: { responsive: 'tablet' },
	},
	{
		accessorKey: 'wage',
		header: '시급',
		meta: { responsive: 'desktop' },
	},
	{
		accessorKey: 'status',
		header: '상태',
		meta: { responsive: 'mobile' },
		cell: ({ getValue }: { getValue: any }) => {
			const value = getValue() as WorkItem['status'];
			const statusClass = {
				'승인 완료': styles.badgeBlue,
				거절: styles.badgeRed,
				대기중: styles.badgeGreen,
			};
			return <span className={`${styles.badge} ${statusClass[value]}`}>{value}</span>;
		},
	},
];

//<=

function dateIncode(dateData: string, workTime: number) {
	const start = dayjs(dateData);
	const startFormat = start.format('YYYY-MM-DD HH:mm');

	const end = start.add(workTime, 'hour');
	const endFormat = end.format('HH:mm');
	return `${startFormat}~${endFormat} ${workTime}시간`;
}

function statusSetFunc(statusprop) {
	switch (statusprop) {
		case 'pending':
			return '대기중';
		case 'accepted':
			return '승인 완료';
		case 'rejected':
			return '거절';
		default:
			return '거절';
	}
}

export default function WorkTable(items) {
	const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>(useDeviceType());
	const [workItems, setWorkItems] = useState<WorkItem[]>([]);

	useEffect(() => {
		//console.log(items.items);
		//const arrItem = Array.from(items);

		const mapped = items.items.map((application: any) => {
			const startDate = application.item.notice.item.startsAt;
			const workTime = application.item.notice.item.workhour;
			const Worktime = dateIncode(startDate, workTime);
			const statusSet = statusSetFunc(application.item.status);
			return {
				id: application.item.id,
				store: application.item.shop.item.name,
				date: Worktime,
				wage: application.item.notice.item.hourlyPay,
				status: statusSet,
				createdAt: application.item.createdAt,
			};
		});
		console.log(mapped);
		setWorkItems(mapped);
	}, [items.items]);

	//창 크기 변경 마다 디바이스타입을 자동으로 다시 계산함
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

	const columns = baseColumns.filter(col => {
		const minDevice = col.meta?.responsive ?? 'desktop';
		if (deviceType === 'mobile') return ['mobile'].includes(minDevice);
		if (deviceType === 'tablet') return ['mobile', 'tablet'].includes(minDevice);
		return true;
	}); //디바이스에 맞게 보여줄 컬럼만 필터링하기
	//meta.responsive 에 따라 표시 여부 결정됨

	const table = useReactTable({
		data: workItems,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		initialState: {
			pagination: {
				pageSize: 5,
			},
		},
	});
	//pagination, row model, column 등 구성

	return (
		<div className={styles.container}>
			<table className={styles.table}>
				<thead>
					{table.getHeaderGroups().map(headerGroup => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map(header => (
								<th key={header.id}>
									{flexRender(header.column.columnDef.header, header.getContext())}
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
				<button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
					&lt;
				</button>
				{table.getPageOptions().map(page => (
					<button
						key={page}
						onClick={() => table.setPageIndex(page)}
						className={table.getState().pagination.pageIndex === page ? styles.active : ''}
					>
						{page + 1}
					</button>
				))}
				<button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
					&gt;
				</button>
			</div>
		</div>
	);
}
