import {
  Badge,
  Button,
  Col,
  Input,
  Label,
  Row,
  UncontrolledTooltip
} from 'reactstrap';
import { useState, useEffect } from 'react';
import moment from 'moment';
import { Edit, Plus, Trash2, ChevronDown, ChevronUp } from 'react-feather';
import { getPagination } from '@src/utility/Utils';

import '../SubCategoryBlock/style.scss';

export default function MainCategoryBlock({
  handleMainCategoryModal,
  mainCategoryCurrentPage,
  mainCategoryRowsPerPage,
  mainCategoryOptions,
  showWarning,
  handleMainCategoryDelete,
  t,
  handleMainCategoryPerPage,
  default_page,
  handleMainCategoryPagination,
  mainCategoryTotalCount,
  is_lock = false,
  setMainCategoryOptions,
  changeOrder,
  selectedMainIds,
  setSelectedMainIds
}) {
  const [isvisible, setIsvisible] = useState(false);

  const toggle = () => {
    setIsvisible(!isvisible);
  };

  const columns = [
    {
      name: (
        <Input
          type="checkbox"
          checked={
            mainCategoryOptions.length > 0 &&
            selectedMainIds.length === mainCategoryOptions.length
          }
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedMainIds(mainCategoryOptions.map(item => item.id));
            } else {
              setSelectedMainIds([]);
            }
          }}
        />
      ),
      selector: (row) => (
        <Input
          type="checkbox"
          checked={selectedMainIds.includes(row.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedMainIds(prev => [...prev, row.id]);
            } else {
              setSelectedMainIds(prev => prev.filter(id => id !== row.id));
            }
          }}
        />
      ),
      headerStyle: { width: '40px', textAlign: 'center' },
      bodyStyle: { width: '40px', textAlign: 'center' }
    },
    {
      name: "№",
      selector: (row, index) =>
        (mainCategoryCurrentPage - 1) * mainCategoryRowsPerPage + index + 1,
      headerStyle: { textAlign: 'center', width: '50px' },
      bodyStyle: { textAlign: 'center', width: '50px' }
    },
    {
      name: `${t('Үндсэн төрөл нэр')}`,
      selector: (row) => row?.name,
      headerStyle: { textAlign: 'left' },
      bodyStyle: { textAlign: 'left' }
    },
    {
      name: `${t('Огноо')}`,
      selector: (row) => moment(row?.created_at).format('YYYY-MM-DD HH:mm:ss'),
      headerStyle: { textAlign: 'center', width: '180px' },
      bodyStyle: { textAlign: 'center', width: '180px' }
    },
    {
      name: `${t('Хэрэглэгч')}`,
      selector: (row) => row?.created_by,
      headerStyle: { textAlign: 'center', width: '150px' },
      bodyStyle: { textAlign: 'center', width: '150px' }
    },
    {
      name: <Edit width={"15px"} />,
      selector: (row) => (
        <>
          <a
            role='button'
            onClick={() => handleMainCategoryModal(row)}
            id={`editCategory${row?.id}`}
          >
            <Badge color="light-secondary" pill>
              <Edit width={"15px"} />
            </Badge>
          </a>
          <UncontrolledTooltip placement='top' target={`editCategory${row.id}`}>
            {t('Засах')}
          </UncontrolledTooltip>
        </>
      ),
      headerStyle: { textAlign: 'center', width: '70px' },
      bodyStyle: { textAlign: 'center', width: '70px' }
    },
    {
      name: <Trash2 width={"15px"} />,
      selector: (row) => (
        <>
          <a
            role='button'
            onClick={() => showWarning({
              header: { title: t(`Устгах`) },
              question: t(`Та энэхүү устгахдаа итгэлтэй байна уу (хамааралтай бүх дэд ангиллууд мөн устгагдана)?`),
              onClick: () => handleMainCategoryDelete(row?.id),
              btnText: t('Устгах'),
            })}
            id={`deleteCategory${row?.id}`}
          >
            <Badge color="light-danger" pill>
              <Trash2 width={"15px"} />
            </Badge>
          </a>
          <UncontrolledTooltip placement='top' target={`deleteCategory${row.id}`}>
            {t('Устгах')}
          </UncontrolledTooltip>
        </>
      ),
      headerStyle: { textAlign: 'center', width: '50px' },
      bodyStyle: { textAlign: 'center', width: '50px' }
    }
  ];

  return (
    <>
      <div
        onClick={toggle}
        className="d-flex justify-content-between align-items-center p-1 cursor-pointer border rounded bg-light"
        style={{ background: "linear-gradient(135deg, #e3f2fd, #bbdefb)" }}
      >
        <h5 className="mb-0">{t("Ерөнхий төрөл")}</h5>
        {isvisible ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>

      {isvisible && (
        <div style={{ overflow: 'auto' }}>
          <Row className='mb-1'>
            <Col className='d-flex justify-content-end'>
              <Button
                color='primary'
                onClick={() => handleMainCategoryModal()}
                style={{ height: '40px' }}
              >
                <Plus size={15} />
                <span className='align-middle ms-50'>{t('Нэмэх')}</span>
              </Button>
            </Col>
          </Row>

          <table className='customTable'>
            <thead>
              <tr>
                {columns.map((col, index) => (
                  <th key={index} style={col.headerStyle}>{col.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mainCategoryOptions.map((row, index) => (
                <tr key={row.id}>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} style={col.bodyStyle}>
                      {typeof col.selector === 'function'
                        ? col.selector(row, index)
                        : col.selector
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <Row className='mt-1'>
            <Col sm='auto'>
              <Input
                type='select'
                bsSize='sm'
                style={{ height: "30px", width: "70px" }}
                value={mainCategoryRowsPerPage}
                onChange={e => handleMainCategoryPerPage(e)}
              >
                {default_page.map((page, idx) => (
                  <option key={idx} value={page}>{page}</option>
                ))}
              </Input>
            </Col>
            <Col>
              <Label for='sort-select'>{t('Хуудсанд харуулах тоо')}</Label>
            </Col>
            <Col md={6}>
              {getPagination(handleMainCategoryPagination, mainCategoryCurrentPage, mainCategoryRowsPerPage, mainCategoryTotalCount)()}
            </Col>
          </Row>
        </div>
      )}
    </>
  );
}
