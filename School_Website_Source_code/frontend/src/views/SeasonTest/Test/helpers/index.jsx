import { t } from 'i18next'

import { Eye, Edit, X, Book, Info } from 'react-feather'

import useModal from "@hooks/useModal"
import { Badge, UncontrolledTooltip } from 'reactstrap';
import moment from 'moment';

export function getColumns (currentPage, rowsPerPage, total_count, handleEdit, handleDelete) {

    const { showWarning } = useModal()

    const page_count = Math.ceil(total_count / rowsPerPage)

    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
        {
            name: "№",
            selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
            maxWidth: "30px",
            center: true,
        },
        {
            name: `${'Хичээлийн нэр'}`,
            selector: (row) => row?.lesson?.name,
            minWidth: "150px",
            wrap:true,
        },
        {
            name: `${'Шалгалт нэр'}`,
            selector: (row) => row?.title,
            minWidth: "100px",
            wrap:true,
        },
        {
            name: `${'Эхлэх хугацаа'}`,
            selector: (row) => moment(row?.start_date).format('YYYY-MM-DD HH-mm'),
            minWidth: "160px",
        },
        {
            name: `${'Дуусах хугацаа'}`,
            selector: (row) => moment(row?.end_date).format('YYYY-MM-DD HH-mm'),
            minWidth: "160px",
        },

        // Устгах үед шалгалтын эхлэх хугацаа эхлээд дуусах хугацаа болоогүй үед устгах боломжгүй
        {
			name: "Үйлдэл",
			center: true,
      minWidth: "150px",
			selector: (row) => {
          // Шалгалт эхэлсэн эсэхийг одоогийн цагтай харьцуулж шалгах
          const hasStarted = row?.start_date ? moment().isAfter(moment(row?.start_date)) : false;

          // Шалгалт эхлээгүй бол засах/устгах боломжтой
          const is_remove = !hasStarted;
          const is_edit = !hasStarted;

          return (
              <div className="text-center" style={{ width: "auto" }}>
                  <>
                      <a
                          role="button"
                          onClick={() => { handleEdit(row) }}
                          id={`complaintListDatatableEdit${row?.id}`}
                          className='me-1'
                      >
                          <Badge color="light-success" pill><Edit width={"15px"} /></Badge>
                      </a>
                      <UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row.id}`} >{t('Засах')}</UncontrolledTooltip>
                  </>

                  {/* Шалгалт эхэлсэн үед харуулах Info icon */}

                  <>
                      <a
                          role="button"
                          id={`complaintListDatatableShow${row?.id}`}
                          className='me-1'
                          href={`/challenge-season/addstudent/${row?.id}/${row?.lesson?.id}`}
                      >
                          <Badge color="light-info"><Book width={"15px"} /></Badge>
                      </a>
                      <UncontrolledTooltip placement='top' target={`complaintListDatatableShow${row.id}`} >{t('Дэлгэрэнгүй')}</UncontrolledTooltip>
                  </>

                  {hasStarted && (
                      <>
                          <a
                              role="button"
                              id={`examStartedInfo${row?.id}`}
                          >
                              <Badge color="light-warning" pill><Info width={"15px"} /></Badge>
                          </a>
                          <UncontrolledTooltip placement='top' target={`examStartedInfo${row?.id}`} >
                              Шалгалт эхэлсэн тул устгах боломжгүйг анхаарна уу
                          </UncontrolledTooltip>
                      </>
                  )}

                  {is_remove && (
                      <>
                          <a
                              role="button"
                              onClick={() => showWarning({
                                  header: {
                                      title: `Шалгалт устгах`,
                                  },
                                  question: `Та энэ асуултыг шалгалтыг устгахдаа итгэлтэй байна уу? Шалгалтын өгсөн оюутнуудын хариулт хамт устахыг анхаарна уу`,
                                  onClick: () => handleDelete(row.id),
                                  btnText: 'Устгах',
                              })}
                              id={`complaintListDatatableCancel${row?.id}`}
                          >
                              <Badge color="light-danger" pill><X width={"15px"} /></Badge>
                          </a>
                          <UncontrolledTooltip placement='top' target={`complaintListDatatableCancel${row.id}`} >Устгах</UncontrolledTooltip>
                      </>
                  )}
              </div>
          )
      },
		},
        {
            name: `${t('Дүн харах')}`,
            selector:  (row) => (
                <div className="text-center" style={{ width: "auto" }}  >
                    <a
                        id={`complaintListDatatableDetail${row?.id}`}
                        className='ms-1'
                        href={`/challenge/detail/${row?.id}`}
                        target={'_blank'}
                    >
                        <Badge color="light-info" pill><Book  width={"15px"} /></Badge>
                    </a>

				</div>
            ),
            center: true,
            minWidth: "50px",
        },
    ]
    return columns
}
