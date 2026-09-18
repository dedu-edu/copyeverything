import { useContext } from 'react';

import { X, Edit, Lock, Shield, ShieldOff, Aperture } from 'react-feather'
import { Badge, UncontrolledTooltip } from 'reactstrap'

import useModal from "@hooks/useModal"
import useLoader from '@hooks/useLoader';
import { t } from 'i18next';

import SchoolContext from "@context/SchoolContext"
import PopoverCell from '@src/components/CPopoverCell';


// Хүснэгтийн баганууд
export function getColumns(currentPage, rowsPerPage, total_count, editModal, handleDelete, user, changePassModal, toggleRightsActivation, openPhysicalModal) {

	const { school_id } = useContext(SchoolContext)

	const page_count = Math.ceil(total_count / rowsPerPage)

	const { showWarning } = useModal()

	const { Loader, isLoading } = useLoader({ isFullScreen: true })

	/** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
	if (currentPage > page_count) {
		currentPage = 1
	}

	const columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
			maxWidth: "30px",
			center: true
		},
		{
			name: t("Оюутны код"),
			selector: (row) => <PopoverCell value={row?.code} />,
			sortable: true,
			center: true
		},
		{
			name: t("Овог"),
			selector: (row) => <PopoverCell value={row?.last_name} />,
			sortable: true,
			center: true
		},
		{
			name: t("Нэр"),
			selector: (row) => <PopoverCell value={row?.first_name} />,
			sortable: true,
			center: true
		},
		{
			name: t("Регистрийн дугаар"),
			selector: (row) => <PopoverCell value={row?.register_num} />,
			sortable: true,
			center: true
		},
		{
			name: t("Мэргэжил"),
			selector: (row) => <PopoverCell value={row?.profession_name} />,
			sortable: true,
			center: true
		},
		{
			name: t("Дамжаа"),
			selector: (row) => <PopoverCell value={row?.group_name} />,
			center: true,
			width: "250px"
		},
		{
			name: t("Курс"),
			selector: (row) => <PopoverCell value={row?.group_level} />,
			center: true
		},
		{
			header: 'status',
			name: t("Суралцаж буй төлөв"),
			selector: (row) => (
				<Badge color="light-primary" pill>
					{t(row.status_name)}
				</Badge>
			),
			sortable: true,
			center: true
		},
		{
			header: 'is_payed',
			name: t("Төлбөр төлөгдсөн эсэх"),
			selector: (row) => (
				<Badge color="light-primary" pill>
					{row.is_payed ? t('Төлбөр төлөгдсөн') : t('Төлбөр төлөөгүй')}
				</Badge>
			),
			sortable: true,
			center: true,
			minWidth: "200px",
		},
	]

	if (Object.keys(user).length > 0) {
		var delete_column = {
			name: t("Үйлдэл"),
			width: "220px",
			center: true,
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					<a
						role="button"
						onClick={() => openPhysicalModal(row)}
						id={`physicalTest${row?.id}`}
						className="me-1"
					>
						<Badge color="light-success" pill>
							<Aperture width={"15px"} />
						</Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`physicalTest${row.id}`}>
						БТАБИ
					</UncontrolledTooltip>
					<a role="button" onClick={() => { editModal(row.id) }}
						id={`complaintListDatatableEdit${row?.id}`}
						className="me-1"
					>
						<Badge color="light-secondary" pill><Edit width={"15px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row.id}`} >Засах</UncontrolledTooltip>
					{
						(user.permissions.includes('lms-student-register-update')) &&
						<>
							<a
								role="button"
								onClick={() => showWarning({
									header: {
										title: t(`Оюутны нууц үг`),
									},
									question: t(`Оюутны нууц үг сэргээх үү?`),
									onClick: () => changePassModal(row.id)
								})}
								id={`complaintListDatatableEditPass${row?.id}`}
								className="me-1"
							>
								<Badge color="light-info" pill><Lock width={"15px"} /></Badge>
							</a>
							<UncontrolledTooltip placement='top' target={`complaintListDatatableEditPass${row.id}`} >Нууц үг сэргээх</UncontrolledTooltip>
						</>
					}
					{
						(user.permissions.includes('lms-student-register-delete')) &&
						<>
							<a role="button"
								onClick={() => showWarning({
									header: {
										title: t(`Оюутан устгах`),
									},
									question: t("Та энэ мэдээллийг устгахдаа итгэлтэй байна уу? Оюутны бүх мэдээлэл устахыг анхаарна уу"),
									onClick: () => handleDelete(row.id),
									btnText: t('Устгах'),
								})}
								id={`complaintListDatatableCancel${row?.id}`}
							>
								<Badge color="light-danger" pill><X width={"100px"} /></Badge>
							</a>
							<UncontrolledTooltip placement='top' target={`complaintListDatatableCancel${row.id}`} >Устгах</UncontrolledTooltip>
						</>
					}
					{
						Object.keys(user).length > 0 && user?.is_superuser &&
						<>
							<a
								role="button"
								onClick={() => showWarning({
									header: {
										title: t(`Оюутны эрх нээлттэй эсэх`),
									},
									question: t(`Оюутны Эрх хаах/нээх үү?`),
									onClick: () => toggleRightsActivation(row.id)
								})}
								id={`complaintListDatatableToggleRightActivation${row?.id}`}
								className="me-1"
							>
								<Badge color="light-warning" pill>{row?.is_active ? <Shield width={"15px"} /> : <ShieldOff width={"15px"} />}</Badge>
							</a>
							<UncontrolledTooltip placement='top' target={`complaintListDatatableToggleRightActivation${row.id}`} >Эрх хаах/нээх</UncontrolledTooltip>
						</>
					}
				</div>
			),
		}
		columns.push(delete_column)
	}

	return columns

}
