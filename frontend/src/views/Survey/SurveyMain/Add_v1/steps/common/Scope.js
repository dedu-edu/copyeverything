import React, { Fragment, useState, useEffect } from 'react'
import {
    Row,
    Col,
    Button,
} from "reactstrap";

import { ChevronLeft, ChevronRight, Feather, BookOpen, Target } from "react-feather"

import Student from "./hamrah/Student"
import Teacher from "./hamrah/Teacher"

import './transition.css'

const SCOPE_KIND_ALL = 7
export const SCOPE_KIND_OYUTAN = 8
export const SCOPE_KIND_EMPLOYEE = 5

function skin_detector() {
    if (window.localStorage.skin === '"dark"') {
        return 'light'
    } else {
        return 'primary'
    }
}

const Scope = ({ setSubmitDatas, stepper, data, editData, editDataGeneral, editDataByType }) => {

    // Api
    const [chosenScope, setChosenScope] = useState([])
    const [ buttonTheme, setButtonTheme ] = useState('primary')

    const handleChosenScopeChange = (scope, ids, isAll) => {
        let newData = null

        switch (scope) {
            case SCOPE_KIND_ALL:
                newData = { is_teacher: false, is_all: true }
                break;
            case SCOPE_KIND_EMPLOYEE:
                newData = { is_teacher: true, is_all: false }
                if (ids) newData['selected_ids'] = ids

                if (isAll) {
                    newData['isAllTeacher'] = true
                    newData['isAllStudent'] = false
                }
                break;
            default:
                newData = { is_teacher: false, is_all: false }
                if (ids) newData['selected_ids'] = ids

                if (isAll) {
                    newData['isAllTeacher'] = false
                    newData['isAllStudent'] = true
                }
                break;
        }

        setChosenScope(newData);
    };

    // to clear old data, because user can press next and back buttons and change values, so we need to reset values of step because otherwise old values can be remained
    function clearStepData() {
        delete data.is_all

        // from teacher component
        delete data.selected_ids
        delete data.is_teacher
        delete data.isAllTeacher

        // from student component. distinct ones
        delete data.isAllStudent
    }

    function handleNextButton(){
        clearStepData()
        setSubmitDatas({ ...data, ...chosenScope })
        stepper.next()
    }

    useEffect(
        () =>
        {
            if (Object.keys(editData).length > 0) {
                if (editData?.scope?.id === SCOPE_KIND_ALL) {
                    handleChosenScopeChange(SCOPE_KIND_ALL)
                } else if (editData?.scope?.id === SCOPE_KIND_OYUTAN) {
                    handleChosenScopeChange(SCOPE_KIND_OYUTAN, editDataGeneral.oyutans)
                } else if (editData?.scope?.id === SCOPE_KIND_EMPLOYEE) {
                    handleChosenScopeChange(SCOPE_KIND_EMPLOYEE, editDataByType.teachers)
                }
            }

        },
        [editData]
    )

    useEffect(()=>{
        if (window.localStorage.skin === '"dark"') {
            setButtonTheme('light')
        } else {
            setButtonTheme('primary')
        }
    },[])

    return (
            <Fragment>
                <Row>
                    <Col className="min-height-800px">
                        <div className='d-flex justify-content-center flex-wrap align-items-center mb-1'>
                        {
                            <div>
                                <Button
                                    onClick={() => handleChosenScopeChange(SCOPE_KIND_EMPLOYEE)}
                                    outline
                                    color={buttonTheme}
                                    className={`button-transition p-3 m-1 ${chosenScope.is_teacher ? 'active' : ''}`}
                                >
                                    Багш <BookOpen />
                                </Button>
                            </div>
                        }
                        <div>
                            <Button
                                onClick={() => handleChosenScopeChange(SCOPE_KIND_OYUTAN)}
                                outline
                                color={buttonTheme}
                                className={`button-transition p-3 m-1 ${!chosenScope.is_teacher && !chosenScope.is_all ? 'active' : ''}`}
                            >
                                Оюутан <Feather />
                            </Button>
                        </div>
                        {
                            <div>
                                <Button
                                    onClick={() => handleChosenScopeChange(SCOPE_KIND_ALL)}
                                    outline
                                    color={buttonTheme}
                                    className={`button-transition p-3 m-1 ${chosenScope.is_all ? 'active' : ''}`}
                                >
                                    Бүгд
                                    <Target className='ms-1' />
                                </Button>
                            </div>
                        }
                        </div>

                        {!chosenScope.is_teacher && !chosenScope.is_all && <Student onChosenScopeChange={handleChosenScopeChange} />}
                        {chosenScope.is_teacher && <Teacher onChosenScopeChange={handleChosenScopeChange} />}

                    </Col>
                </Row>
                <Col md={12} className="text-center mt-2">
                    <div className='d-flex justify-content-between mt-3'>
                        <Button color='secondary' className='btn-prev' outline onClick={() => stepper.previous()}>
                            <ChevronLeft size={14} className='align-middle me-sm-25 me-0'></ChevronLeft>
                            <span className='align-middle d-sm-inline-block d-none'>Өмнөх</span>
                        </Button>
                        <Button color='primary' className='btn-next' onClick={handleNextButton}>
                            <span className='align-middle d-sm-inline-block d-none'>Дараах</span>
                            <ChevronRight size={14} className='align-middle ms-sm-25 ms-0'></ChevronRight>
                        </Button>
                    </div>
                </Col>
            </Fragment>
    )
}
export default Scope;


