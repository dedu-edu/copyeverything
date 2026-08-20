import { useContext, useEffect, useState } from 'react'
// ** Reactstrap Imports
import { DropdownToggle, UncontrolledDropdown, UncontrolledTooltip, DropdownMenu, DropdownItem } from 'reactstrap'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import ActiveYearContext from '@context/ActiveYearContext'

const YearDropDown = () => {

    const { setYearContext, setSeasonContext, setSeasonNameContext, setActiveWeek } = useContext(ActiveYearContext)

    const [yearName, setYear] = useState('')
    const [seasonName, setSeason] = useState('')
    const [seasonId, setSeasonId] = useState('')
    const [semesters, setSemesters] = useState([]);

    // Api
    const activeYearApi = useApi().settings.activeyear
	const { fetchData } = useLoader({})

    /* Жагсаалтын дата авах функц */
    async function getDatas() {
        const {success, data: ApiResult} = await fetchData(activeYearApi.get())
        if(success) {
            setSemesters(ApiResult)

            const SEASON_TYPE_ACTIVE = 1
            const data = ApiResult.find(item => item.season_type === SEASON_TYPE_ACTIVE)

            setYear(data?.active_lesson_year || '')
            setSeason(data?.active_season)
            setActiveWeek(data?.active_week)

            setSeasonNameContext(data?.active_season_name || '')
            setSeasonContext(data?.active_lesson_season )

            setYearContext(data?.active_lesson_year || '')
            setSeason(data?.active_season_name)
        }
    }

    const handleSemesterUpdate = (e, data) => {
        e.preventDefault()
        setSeason(data?.active_season_name)
        setSeasonContext(data?.active_lesson_season)
        setSeasonNameContext(data?.active_season_name)

        setYear(data?.active_lesson_year)
        setYearContext(data?.active_lesson_year)
    }

    // useEffect(() => {
    //     setYearContext(yearName)
    //     setSeasonNameContext(seasonName)
    //     setSeasonContext(seasonId)
    // },[yearName, seasonName, seasonId])

    useEffect(() => {
        getDatas()
    },[])

    return (
        <UncontrolledDropdown href='/' tag='li' className='dropdown-language nav-item'>
            <DropdownToggle href='/' tag='a' className='nav-link' onClick={e => e.preventDefault()}>
                <i className="fas fa-th-large me-50"></i>
                <span className='selected-language'>{yearName}, {seasonName}</span>
            </DropdownToggle>
             <DropdownMenu className='me-0' style={{ maxHeight: '600px', overflowY: 'auto'}}>
                {
                    semesters.map((data, idx) =>
                    {
                        const { active_lesson_year, active_season_name } = data
                        return (
                            <DropdownItem key={idx} href='/' tag='a' onClick={e => handleSemesterUpdate(e, data)} data-bs-spy="scroll">
                                <i className="far fa-circle"></i>
                                <span className='ms-1 ' style={{ fontSize: '13px'}}>{active_lesson_year}, {active_season_name}</span>
                            </DropdownItem>
                        )
                    })
                }
            </DropdownMenu>
        </UncontrolledDropdown>
    )
}

export default YearDropDown
