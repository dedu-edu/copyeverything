// ** React Imports
import { useRef, useState, Fragment, useEffect, useCallback } from 'react'

// ** Custom Components
import Wizard from '@components/wizard'
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button
} from "reactstrap";

import { Info, X, Flag, Target } from 'react-feather'

// ** Steps
import Type from './steps/Type'
import common from './steps/common'
import soul from './steps/soul'
import useLoader from '@src/utility/hooks/useLoader';
import { getDataById } from '../helpers';
import useApi from '@src/utility/hooks/useApi';

const EDIT_GENERAL = 1
const EDIT_COMMON = 2
const EDIT_SOUL = 3

const Createmodal = ({ open, handleModal, editData, isEdit, refreshDatas, toggle, toggleNested, toggleAll, closeAll, nestedModal }) => {
    // primitives
    const closeBtn = <X className="cursor-pointor" size={15} onClick={toggleNested} style={{ cursor: "pointer" }} />

    // other hooks
    const ref = useRef(null)
    const surveyAPI = useApi().survey
    const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: true })

    // states
    const [stepper, setStepper] = useState(null)
    const [submitDatas, setSubmitDatas] = useState({})
    const [editDataGeneral, setEditDataGeneral] = useState({})
    const [editDataByType, setEditDataByType] = useState({})

    // array is not in global variable because only in this way values will be updated
    const [steps, setSteps] = useState([
        {
            id: 'survey_type',
            title: 'Төрөл',
            subtitle: 'Судалгааны төрөл',
            icon: <Target size={18} />,
            content: <Type
                stepper={stepper}
                setSubmitDatas={setSubmitDatas}
                data={submitDatas}
                editDataGeneral={editDataGeneral}
                setEditDataByType={setEditDataByType}
            />
        },
        {
            id: 'scope',
            title: 'Хамрах хүрээ',
            subtitle: 'Судалгааг хэнээс авах вэ?',
            icon: <Target size={18} />,
            content: <common.Scope
                stepper={stepper}
                setSubmitDatas={setSubmitDatas}
                data={submitDatas}
                editData={editData}
                editDataGeneral={editDataGeneral}
                editDataByType={editDataByType}
            />
        },
        {
            id: 'main-information',
            title: 'Ерөнхий мэдээлэл',
            subtitle: 'Судалгааны мэдээлэл',
            icon: <Info size={18} />,
            content: <common.MainInfo
                stepper={stepper}
                setSubmitDatas={setSubmitDatas}
                data={submitDatas}
                editData={editData}
                editDataGeneral={editDataGeneral}
            />
        },
        {
            id: 'asuult',
            title: 'Асуулт',
            subtitle: 'Судалгааны асуулт',
            icon: <Flag size={18} />,
            content: <common.Asuult
                stepper={stepper}
                setSubmitDatas={setSubmitDatas}
                data={submitDatas}
                editData={editData}
                editDataGeneral={editDataGeneral}
                editDataByType={editDataByType}
                isEdit={isEdit}
                handleModal={handleModal}
                refreshDatas={refreshDatas}
            />
        }
    ])

    // to update wizard e.g. if steps changed with new props in 'content' field
    function syncSteps() {
        // array is not in global variable because only in this way values will be updated
        let stepsWithUpdatedValues = null

        if (submitDatas?.is_soul) stepsWithUpdatedValues = [
            {
                id: 'survey_type',
                title: 'Төрөл',
                subtitle: 'Судалгааны төрөл',
                icon: <Target size={18} />,
                content: <Type
                    stepper={stepper}
                    setSubmitDatas={setSubmitDatas}
                    data={submitDatas}
                    editDataGeneral={editDataGeneral}
                    setEditDataByType={setEditDataByType}
                />
            },
            {
                id: 'scope',
                title: 'Хамрах хүрээ',
                subtitle: 'Судалгааг хэнээс авах вэ?',
                icon: <Target size={18} />,
                content: <common.Scope
                    stepper={stepper}
                    setSubmitDatas={setSubmitDatas}
                    data={submitDatas}
                    editData={editData}
                    editDataGeneral={editDataGeneral}
                    editDataByType={editDataByType}
                />
            },
            {
                id: 'main-information',
                title: 'Ерөнхий мэдээлэл',
                subtitle: 'Судалгааны мэдээлэл',
                icon: <Info size={18} />,
                content: <common.MainInfo
                    stepper={stepper}
                    setSubmitDatas={setSubmitDatas}
                    data={submitDatas}
                    editData={editData}
                    editDataGeneral={editDataGeneral}
                    editDataByType={editDataByType}
                />
            },
            {
                id: 'asuult',
                title: 'Асуулт',
                subtitle: 'Судалгааны асуулт',
                icon: <Flag size={18} />,
                content: <common.Asuult
                    stepper={stepper}
                    setSubmitDatas={setSubmitDatas}
                    data={submitDatas}
                    editData={editData}
                    editDataGeneral={editDataGeneral}
                    editDataByType={editDataByType}
                    isEdit={isEdit}
                    handleModal={handleModal}
                    refreshDatas={refreshDatas}
                />
            }
        ]

        else stepsWithUpdatedValues = [
            {
                id: 'survey_type',
                title: 'Төрөл',
                subtitle: 'Судалгааны төрөл',
                icon: <Target size={18} />,
                content: <Type
                    stepper={stepper}
                    setSubmitDatas={setSubmitDatas}
                    data={submitDatas}
                    editDataGeneral={editDataGeneral}
                    setEditDataByType={setEditDataByType}
                />
            },
            {
                id: 'scope',
                title: 'Хамрах хүрээ',
                subtitle: 'Судалгааг хэнээс авах вэ?',
                icon: <Target size={18} />,
                content: <common.Scope
                    stepper={stepper}
                    setSubmitDatas={setSubmitDatas}
                    data={submitDatas}
                    editData={editData}
                    editDataGeneral={editDataGeneral}
                    editDataByType={editDataByType}
                />
            },
            {
                id: 'main-information',
                title: 'Ерөнхий мэдээлэл',
                subtitle: 'Судалгааны мэдээлэл',
                icon: <Info size={18} />,
                content: <common.MainInfo
                    stepper={stepper}
                    setSubmitDatas={setSubmitDatas}
                    data={submitDatas}
                    editData={editData}
                    editDataGeneral={editDataGeneral}
                />
            },
            {
                id: 'asuult',
                title: 'Асуулт',
                subtitle: 'Судалгааны асуулт',
                icon: <Flag size={18} />,
                content: <common.Asuult
                    stepper={stepper}
                    setSubmitDatas={setSubmitDatas}
                    data={submitDatas}
                    editData={editData}
                    editDataGeneral={editDataGeneral}
                    editDataByType={editDataByType}
                    isEdit={isEdit}
                    handleModal={handleModal}
                    refreshDatas={refreshDatas}
                />
            }
        ]

        setSteps(stepsWithUpdatedValues)
    }

    // to give updated stepper into steps' contents stepper dependency is used, because stepper changes only after change of steps prop
    useEffect(() => {
        syncSteps()
    }, [submitDatas, stepper, editDataGeneral, editDataByType])

    // #region to get general data
    const getEditDataGeneral = useCallback(() => {
        if (editData.id) getDataById({ fetchData: fetchData, get: (id) => surveyAPI.getOne(id, EDIT_GENERAL), id: editData.id, setDatas: setEditDataGeneral })
    }, [editData.id])

    useEffect(() => {
        if (isEdit) getEditDataGeneral()
    }, [editData.id])
    // #endregion

    // #region to get common/soul data
    const getEditDataByType = useCallback(() => {
        let mode = EDIT_COMMON
        if (submitDatas?.is_soul) mode = EDIT_SOUL
        if (editData.id) getDataById({ fetchData: fetchData, get: (id) => surveyAPI.getOne(id, mode), id: editData.id, setDatas: setEditDataByType })
    }, [editData.id, submitDatas?.is_soul])

    useEffect(() => {
        if (isEdit) getEditDataByType()
    }, [editData.id, submitDatas?.is_soul])
    // #endregion

    return (
        <Fragment>
            {/* Модаль хаахдаа итгэлтэй байгаа эсэхийг шалгах давхар модаль */}
            <Modal
                isOpen={nestedModal}
                toggle={toggleNested}
                onClosed={closeAll ? toggle : undefined}
                centered={true}
            >
                <ModalHeader>Гарахдаа итгэлтэй байна уу?</ModalHeader>
                <ModalBody>Одоо гарвал таны хийсэн бүхэн устгагдах болно.</ModalBody>
                <ModalFooter>
                    <Button color="primary" outline onClick={toggleAll}>
                        Тийм
                    </Button>
                    <Button color="secondary" className="fw-bolder" outline onClick={toggleNested}>
                        Үгүй
                    </Button>{' '}
                </ModalFooter>
            </Modal>
            {/* Үндсэн модаль */}
            <Modal
                isOpen={open}
                toggle={toggleNested}
                className='sidebar-xl'
                modalClassName='modal-slide-in'
                contentClassName='pt-0'
                style={{ maxWidth: '1300px', width: '100%', }}
            >
                <ModalHeader
                    className="mb-1"
                    toggle={toggleNested}
                    close={closeBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{"Судалгаа авах"}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    {isLoading && Loader}
                    <div className='horizontal-wizard'>
                        {/* key prop is used because only in this way steps changing updates wizard properly */}
                        <Wizard key={steps} instance={el => setStepper(el)} ref={ref} steps={steps} />
                    </div>
                </ModalBody>
            </Modal>
        </Fragment>
    )
}

export default Createmodal;