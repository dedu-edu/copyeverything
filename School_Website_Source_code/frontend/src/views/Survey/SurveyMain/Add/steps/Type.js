import { Fragment, useEffect, useState } from 'react'
import { BookOpen, ChevronLeft, ChevronRight, Feather } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { Button, Col, Row } from 'reactstrap'

import './transition.css'

const SOUL_TYPE_TEACHERS_LESSONS = 2

export default function Type({ setSubmitDatas, stepper, data, editDataGeneral }) {
    const { t } = useTranslation()
    const [buttonTheme, setButtonTheme] = useState('primary')

    const handleChoice = (isSoul, soulType) => {
        setSubmitDatas({ ...data, is_soul: isSoul, soul_type: soulType })
    }

    function handleNextButton() {
        setSubmitDatas({ ...data, isAllStudent: true })
        stepper.next()
    }

    useEffect(() => {
        if (Object.keys(editDataGeneral).length) {
            setSubmitDatas({ ...data, is_soul: editDataGeneral.is_soul })
        }
    }, [editDataGeneral.is_soul])

    useEffect(() => {
        if (window.localStorage.skin === '"dark"') {
            setButtonTheme('light')
        } else {
            setButtonTheme('primary')
        }
    }, [])

    return (
        <Fragment>
            <Row>
                <Col className='min-height-800px'>
                    <div className='d-flex justify-content-center flex-wrap align-items-center mb-1'>
                        <div>
                            <Button
                                onClick={() => handleChoice()}
                                outline
                                color={buttonTheme}
                                className={`button-transition p-3 m-1 ${data?.is_soul ? '' : 'active'}`}
                            >
                                {t('Энгийн')} <BookOpen />
                            </Button>
                        </div>
                        <div>
                            <Button
                                onClick={() => handleChoice(true, SOUL_TYPE_TEACHERS_LESSONS)}
                                outline
                                color={buttonTheme}
                                className={`button-transition p-3 m-1 ${data?.is_soul ? 'active' : ''}`}
                            >
                                {t('Сэтгэл ханамжийн')} <Feather />
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>
            <Col md={12} className='text-center mt-2'>
                <div className='d-flex justify-content-between mt-3'>
                    <Button color='secondary' className='btn-prev' outline onClick={() => stepper.previous()}>
                        <ChevronLeft size={14} className='align-middle me-sm-25 me-0'></ChevronLeft>
                        <span className='align-middle d-sm-inline-block d-none'>{t('Өмнөх')}</span>
                    </Button>
                    <Button color='primary' className='btn-next' onClick={handleNextButton}>
                        <span className='align-middle d-sm-inline-block d-none'>{t('Дараах')}</span>
                        <ChevronRight size={14} className='align-middle ms-sm-25 ms-0'></ChevronRight>
                    </Button>
                </div>
            </Col>
        </Fragment>
    )
}
