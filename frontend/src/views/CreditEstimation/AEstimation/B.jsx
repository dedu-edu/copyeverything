import { useContext, useEffect, useState } from 'react'
import AuthContext from '@context/AuthContext'
import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'
import { ReactSelectStyles } from '@utils'
import classnames from 'classnames'
import { Search } from 'react-feather'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import Select from 'react-select'
import {
  Button,
  Col,
  Input,
  Label,
  Pagination,
  PaginationItem,
  PaginationLink,
  Row
} from 'reactstrap'
import { useNavigate } from 'react-router-dom'
import SchoolContext from '@context/SchoolContext'

function Index() {
  const { control, formState: { errors } } = useForm({})
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const { t } = useTranslation()

  const default_page = [10, 15, 50, 75, 100]

  const [datas, setDatas] = useState([])
  const [requirements, setRequirements] = useState([])

  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(100)
  const [searchValue, setSearchValue] = useState('')
  const [total_count, setTotalCount] = useState(1)
  const [sortField, setSort] = useState('')
  const [department_data, setDepartmentData] = useState([]);
	const [departmentId, setDepartmentId] = useState([]);
  const { school_id } = useContext(SchoolContext)

  // const [suborg_option, setSubOrgOption] = useState([])
  // const [sub_org, setSubOrgId] = useState('')

  const totalPages = Math.ceil(total_count / rowsPerPage)

  const { isLoading, fetchData } = useLoader({ isFullScreen: false })
  const { fetchData: tableFetch } = useLoader({ isFullScreen: false })

  const settingsApi = useApi(true).credit.settings
  const BApi = useApi(true).estimate
  const departmentApi = useApi().hrms.department

  async function getDatas() {
    const { success, data } = await tableFetch(
      BApi.getData(
        rowsPerPage,
        currentPage,
        sortField,
        searchValue,
        departmentId,
        'B'
      )
    )

    if (success) {
      setTotalCount(data?.teachers?.count || 0)
      setDatas(data?.teachers?.results || [])
      setRequirements(data?.requirements || [])
    }
  }

  /* Тэнхим дата авах функц */
	async function getDepartmentOption() {
		const { success, data } = await fetchData(departmentApi.getSelectSchool())
		if (success) {
			setDepartmentData(data)
		}
	}
  useEffect(() => {
    getDepartmentOption()
  }, [departmentId])

  useEffect(() => {
    const timeout = setTimeout(() => getDatas(), 600)
    return () => clearTimeout(timeout)
  }, [currentPage, rowsPerPage, sortField, searchValue, departmentId])

  const handleFilter = e => setSearchValue(e.target.value.trimStart())

  return (
    <>
      <Row className='mx-0 mt-50'>
        <Col md={3}>
					<Label className="form-label" for="salbar">
						{t('Тэнхим')}
					</Label>
					<Controller
						control={control}
						defaultValue=''
						name="salbar"
						render={({ field: { value, onChange} }) => {
							return (
								<Select
									name="salbar"
									id="salbar"
									classNamePrefix='select'
									isClearable
									className='react-select'
									isLoading={isLoading}
									placeholder={t('-- Сонгоно уу --')}
									options={department_data || []}
									value={value && department_data.find((c) => c.id === value)}
									noOptionsMessage={() => t('Хоосон байна.')}
									onChange={(val) => {
										onChange(val?.id || '')
										setDepartmentId(val?.id)
									}}
									styles={ReactSelectStyles}
									getOptionValue={(option) => option.id}
									getOptionLabel={(option) => option.name}
								/>
							)
						}}
					></Controller>
				</Col>
        {/* <Col md={4}>
          <Label>{t('Тэнхим')}</Label>
          <Controller
            name="sub_org"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Select
                isClearable
                className={classnames('react-select')}
                options={suborg_option}
                getOptionLabel={o => o.name}
                getOptionValue={o => o.id}
                value={suborg_option.find(o => o.id === value)}
                onChange={v => {
                  onChange(v?.id || '')
                  setSubOrgId(v?.id || '')
                }}
                styles={ReactSelectStyles}
              />
            )}
          />
        </Col> */}
      </Row>

      <Row className='justify-content-between mx-0 mb-1 mt-1'>
        <Col md={6} className='d-flex align-items-center'>
          <Input
            type='select'
            bsSize='sm'
            style={{ width: 100 }}
            value={rowsPerPage}
            onChange={e => setRowsPerPage(+e.target.value)}
          >
            {default_page.map(p => (
              <option key={p}>{p}</option>
            ))}
          </Input>

          <Pagination className='ms-1'>
            <PaginationItem disabled={currentPage === 1}>
              <PaginationLink previous onClick={() => setCurrentPage(p => p - 1)} />
            </PaginationItem>

            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i} active={currentPage === i + 1}>
                <PaginationLink onClick={() => setCurrentPage(i + 1)}>
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem disabled={currentPage === totalPages}>
              <PaginationLink next onClick={() => setCurrentPage(p => p + 1)} />
            </PaginationItem>
          </Pagination>
        </Col>

        <Col md={6} className='d-flex'>
          <Input
            bsSize='sm'
            placeholder={t('Хайх')}
            value={searchValue}
            onChange={handleFilter}
          />
          <Button size='sm' className='ms-50' color='primary'>
            <Search size={14} />
          </Button>
        </Col>
      </Row>

<div style={{ overflow: 'auto', maxHeight: "70vh" }}>
  <table className="table table-sm table-bordered text-center tb" style={{ fontSize: 12 }}>
    <thead>
      <tr>
        <th rowSpan="3">№</th>
        <th rowSpan="3">Нэр</th>
        {requirements.map(m => (
          <th key={m.id} colSpan={m.subcategories.length * 1}>
            {m.name}
          </th>
        ))}
        <th rowSpan="3">Нийт</th> {/* Sum for row */}
      </tr>

      <tr>
        {requirements.map(m =>
          m.subcategories.map(s => (
            <th style={{ minWidth: "250px" }} key={s.id} colSpan={1}>{s.name}</th>
          ))
        )}
      </tr>

      <tr>
        {requirements.map(m =>
          m.subcategories.flatMap(s => [
            <th key={`s-${s.id}`}>Б/Ц:{s.score} - Нэгж:({s.value})</th>
          ])
        )}
      </tr>
    </thead>

    <tbody>
      {datas.length ? datas.map((t, i) => {
        const recordMap = {};
        t.records?.items?.forEach(r => {
          recordMap[r.id] = r.approve_score || 0;
        });

        // Calculate row sum
        const rowSum = requirements.reduce((sum, m) =>
          sum + m.subcategories.reduce((s, sc) => s + (recordMap[sc.id] || 0), 0)
        , 0);

        return (
          <tr key={t.id}>
            <td>{i + 1}</td>
            <td
              className="cursor-pointer"
              onClick={() => navigate(`/credit/profile/${t.id}/`)}
            >
              {t.full_name}
            </td>

            {requirements.map((m) =>
              m.subcategories.map((s) => (
                <td key={`r-${t.id}-${s.id}`}>
                  {recordMap[s.id] !== undefined ? recordMap[s.id] : 0}
                </td>
              ))
            )}

            <td>{rowSum}</td> {/* Row total */}
          </tr>
        );
      }) : (
        <tr>
          <td colSpan={requirements.reduce((n, m) => n + m.subcategories.length, 3)}>
            Мэдээлэл олдсонгүй
          </td>
        </tr>
      )}

      {/* Column sums */}
      <tr>
        <td colSpan={2}><strong>Нийт</strong></td>
        {requirements.flatMap(m =>
          m.subcategories.map(s => {
            const colSum = datas.reduce((sum, t) => {
              const rec = t.records?.items?.find(r => r.id === s.id);
              return sum + (rec?.approve_score || 0);
            }, 0);
            return <td key={`sum-${s.id}`}><strong>{colSum}</strong></td>
          })
        )}
        <td>
          <strong>
            {datas.reduce((total, t) => {
              const rSum = requirements.reduce((sum, m) =>
                sum + m.subcategories.reduce((s, sc) => {
                  const rec = t.records?.items?.find(r => r.id === sc.id);
                  return s + (rec?.approve_score || 0);
                }, 0)
              , 0);
              return total + rSum;
            }, 0)}
          </strong>
        </td>
      </tr>
    </tbody>
  </table>
</div>

    </>
  )
}

export default Index
