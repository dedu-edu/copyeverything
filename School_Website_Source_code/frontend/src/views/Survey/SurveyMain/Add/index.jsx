// ** React Imports
import { useRef, useState, Fragment, useEffect, useCallback } from 'react'

// ** Custom Components
import Wizard from '@components/wizard'
import useLoader from '@src/utility/hooks/useLoader';
import useApi from '@src/utility/hooks/useApi';

import {
	Modal,
	ModalHeader,
	ModalBody,
    ModalFooter,
    Button
} from "reactstrap";

import { Info, X, Flag, Target} from 'react-feather'

// ** Steps
import MainInfo from './steps/MainInfo'
import Asuult from './steps/Asuult';
import Scope from './steps/Scope';
import Type from './steps/Type';
import soulSteps from './soulSteps';
import { getDataById } from '../helpers';

const Createmodal = ({ open, handleModal, editData, isEdit, refreshDatas, toggle, toggleNested, toggleAll, closeAll, nestedModal }) => {
    const closeBtn = (
        <X className="cursor-pointor" size={15} onClick={toggleNested} style={{cursor: "pointer"}} />
    )

    const ref = useRef(null)
    const [stepper, setStepper] = useState(null)

    const [datas, setSubmitDatas] = useState({})

    // #region to get general/common/soul datas
    const surveyAPI = useApi().survey
    const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: true })

    const [editDataGeneral, setEditDataGeneral] = useState({})
    const [editDataByType, setEditDataByType] = useState({})

    const EDIT_GENERAL = 1
    const EDIT_COMMON = 2
    const EDIT_SOUL = 3

    const getEditDataGeneral = useCallback(() => {
        if (editData.id) getDataById({ fetchData: fetchData, get: (id) => surveyAPI.getOne(id, EDIT_GENERAL), id: editData.id, setDatas: setEditDataGeneral })
    }, [editData.id])

    useEffect(() => {
        if (isEdit) getEditDataGeneral()
    }, [editData.id])

    const getEditDataByType = useCallback(() => {
        let mode = EDIT_COMMON
        if (datas?.is_soul) mode = EDIT_SOUL
        if (editData.id) getDataById({ fetchData: fetchData, get: (id) => surveyAPI.getOne(id, mode), id: editData.id, setDatas: setEditDataByType })
    }, [editData.id, datas?.is_soul])

    useEffect(() => {
        if (isEdit) getEditDataByType()
    }, [editData.id, datas?.is_soul])
    // #endregion

    const typeStep = {
        id: 'survey_type',
        title: 'Төрөл',
        subtitle: 'Судалгааны төрөл',
        icon: <Target size={18} />,
        content: <Type
            stepper={stepper}
            setSubmitDatas={setSubmitDatas}
            data={datas}
            editDataGeneral={editDataGeneral}
            setEditDataByType={setEditDataByType}
        />
    }

    const defaultSteps = [
        {
            id: 'scope',
            title: 'Хамрах хүрээ',
            subtitle: 'Судалгааг хэнээс авах вэ?',
            icon: <Target size={18} />,
            content: <Scope
                        stepper={stepper}
                        setSubmitDatas={setSubmitDatas}
                        data={datas}
                        editData={editData}
                    />
        },
        {
            id: 'main-information',
            title: 'Ерөнхий мэдээлэл',
            subtitle: 'Судалгааны мэдээлэл',
            icon: <Info size={18} />,
            content: <MainInfo
                        stepper={stepper}
                        setSubmitDatas={setSubmitDatas}
                        data={datas}
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
            content: <Asuult
                        stepper={stepper}
                        cdata={datas}
                        editData={editData}
                        editDataGeneral={editDataGeneral}
                        editDataByType={editDataByType}
                        isEdit={isEdit}
                        handleModal={handleModal}
                        refreshDatas={refreshDatas}
                    />
        },
    ]

    let steps = [
        typeStep,
        ...defaultSteps
    ]

    if (datas.is_soul) steps = [
        typeStep,
        {
            id: 'scope',
            title: 'Хамрах хүрээ',
            subtitle: 'Судалгааг хэнээс авах вэ?',
            icon: <Target size={18} />,
            content: <soulSteps.Scope
                stepper={stepper}
                setSubmitDatas={setSubmitDatas}
                data={datas}
                editData={editData}
            />
        },
        {
            id: 'main-information',
            title: 'Ерөнхий мэдээлэл',
            subtitle: 'Судалгааны мэдээлэл',
            icon: <Info size={18} />,
            content: <soulSteps.MainInfo
                stepper={stepper}
                setSubmitDatas={setSubmitDatas}
                data={datas}
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
            content: <soulSteps.Asuult
                stepper={stepper}
                setSubmitDatas={setSubmitDatas}
                data={datas}
                editData={editData}
                editDataGeneral={editDataGeneral}
                editDataByType={editDataByType}
                isEdit={isEdit}
                handleModal={handleModal}
                refreshDatas={refreshDatas}
            />
        }
    ]

    return  (
        <Fragment>
            {/* Модаль хаахдаа итгэлтэй байгаа эсэхийг шалгах давхар модаль */}
            <Modal
                isOpen={nestedModal}
                toggle={toggleNested}
                onClosed={closeAll ? toggle : undefined}
                centered={true}
                className="modal-sm"
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
                keyboard={true}
                style={{maxWidth: '1300px', width: '100%',}}
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
                        <Wizard instance={el => setStepper(el)} ref={ref} steps={steps} />
                    </div>
                </ModalBody>
            </Modal>
        </Fragment>
    )
}

export default Createmodal;