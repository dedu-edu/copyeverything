import React, { useState, Fragment, useEffect, useContext } from 'react'

import { useNavigate } from 'react-router-dom'

import { TabContent, Nav, NavItem, NavLink, Card } from 'reactstrap'

import { Award, ChevronsLeft } from 'react-feather'

import Address from './Address'
import AdmissionScore from './AdmissionScore'
import Education from './Education'
import Family from './Family'
import MainInformation from './MainInformation'
import AuthContext from "@context/AuthContext"

import { useTranslation } from 'react-i18next'
import Medal from './Medal'
import Sport from './Sport'
import Awards from './Awards'
import SocialActivity from './SocialActivity'
import PersonalSkill from './Personalskill'
import Discipline from './Discipline'
import SelfDevelopment from './Selfdevelopment'
import Research from '@src/navigation/vertical/Research'
import ResearchCompetition from './ResearchCompetition'
import DefinitionText from './DefinitionText'
import Punishment from './Punishment'


const Detail = () => {
    const { t } = useTranslation()
    const { user } = useContext(AuthContext)

    const nav_menus = [
        {
            active_id: 1,
            name: t('Мэдээлэл'),
            component: <MainInformation />,
            disabled: (user?.permissions?.includes('lms-student-register-update') ? false : true)
        },
        {
            active_id: 2,
            name: t('Хаяг (1.8,1.9)'),
            component: <Address />,
            disabled: (user?.permissions?.includes('lms-student-register-update') ? false : true)
        },
        {
            active_id: 3,
            name: t('Гэр бүл (1.13)'),
            component: <Family />,
            disabled: (user?.permissions?.includes('lms-student-register-update') ? false : true)
        },
        {
            active_id: 4,
            name: t('Хувь хүний ур чадвар (2)'),
            component: <SelfDevelopment />,
            disabled: (user?.permissions?.includes('lms-student-register-update') ? false : true)
        },
        {
            active_id: 5,
            name: t('Эрдэм шинжилгээний илтгэл (3)'),
            component: <ResearchCompetition />,
            disabled: (user?.permissions?.includes('lms-student-register-update') ? false : true)
        },
        {
            active_id: 6,
            name: t('Спортын уралдаан, тэмцээнд оролцсон байдал (4)'),
            component: <Sport />,
            disabled: user?.permissions?.includes('lms-student-register-update') ? false : true
        },
        {
            active_id: 7,
            name: t('Тэмдэг, медаль, шагнал, урамшуулал (5)'),
            component: <Awards />,
            disabled: user?.permissions?.includes('lms-student-register-update') ? false : true

        },
        {
            active_id: 8,
            name: t('Нийгэм олон нийтийн үйл ажиллагаа (6)'),
            component: <SocialActivity />,
            disabled: user?.permissions?.includes('lms-student-register-update') ? false : true

        },
        {
            active_id: 9,
            name: t('Хувь хүний ур чадвар, чадамж (7)'),
            component: <PersonalSkill />,
            disabled: user?.permissions?.includes('lms-student-register-update') ? false : true
        },
        // {
        //     active_id: 10,
        //     name: t('Хувь хүний ур чадвар, чадамж (8)'),
        //     component: <PersonalSkill />,
        //     disabled: user?.permissions?.includes('lms-student-register-update') ? false : true
        // },
        {
            active_id: 11,
            name: t('Сахилга, ёс зүйн байдал (8)'),
            component: <Discipline />,
            disabled: user?.permissions?.includes('lms-student-register-update') ? false : true
        },
        {
            active_id: 12,
            name: t('Ял шийтгэл тодорхойлолт (9)'),
            component: <Punishment />,
            disabled: user?.permissions?.includes('lms-student-register-update') ? false : true
        },
        {
            active_id: 13,
            name: t('Оюутны тодорхойлолт (10)'),
            component: <DefinitionText />,
            disabled: (user?.permissions?.includes('lms-student-register-update') ? false : true)
        },
        {
            active_id: 14,
            name: t('Боловсрол'),
            component: <Education />,
            disabled: (user?.permissions?.includes('lms-student-register-update') ? false : true)
        },
        {
            active_id: 15,
            name: t('ЭЕШ-ын оноо'),
            component: <AdmissionScore />,
            disabled: (user?.permissions?.includes('lms-student-register-update') ? false : true)
        },
        {
            active_id: 16,
            name: t('Бие даан хөгжих сургалт'),
            component: <Medal />,
            disabled: user?.permissions?.includes('lms-student-register-update') ? false : true

        },
    ]
    const navigation = useNavigate()

    const [active, setActive] = useState('1')
    const [component, setComponent] = useState('')

    const toggle = tab => {
        if (active !== tab) {
            setActive(tab)
        }
    }

    useEffect(() => {
        var check = nav_menus.find(menus => menus.active_id == active)
        setComponent(check.component)
    },[active])

    return (
        <Fragment>
            <Card body>
                <div role="button" style={{fontSize: "15px"}} onClick={() => navigation('/student/register/')}>
                    <ChevronsLeft/>{t('Буцах')}
                </div>
                <Nav tabs>
                    {
                        nav_menus.map((menu, idx) => {
                            return(
                                <NavItem key={idx}>
                                    <NavLink
                                        active={active == menu.active_id}
                                        onClick={() => {
                                            toggle(menu.active_id)
                                        }}
                                        disabled={menu?.disabled}
                                    >
                                        {menu.name}
                                    </NavLink>
                                </NavItem>
                            )
                        })
                    }
                </Nav>
                <TabContent className='py-50' activeTab={active}>
                    {
                        component && component
                    }
                </TabContent>
            </Card>
        </Fragment>
    )
}
export default Detail
