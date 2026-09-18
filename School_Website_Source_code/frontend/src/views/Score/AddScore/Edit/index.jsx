// ** React imports
import React, { Fragment, useState, useEffect, useContext } from 'react'

import Select from 'react-select'

import useApi from "@hooks/useApi";

import useLoader from "@hooks/useLoader";

import ActiveYearContext from "@context/ActiveYearContext"

import { ReactSelectStyles } from "@utils"

import classnames from "classnames";

import { useTranslation } from "react-i18next";

import { useForm, Controller } from "react-hook-form";

import { validate, convertDefaultValue } from "@utils"


import { X } from "react-feather";

import {
    Row,
    Col,
    Form,
    Modal,
    Input,
    Label,
    Button,
    ModalBody,
    ModalHeader,
    FormFeedback,
    Spinner
} from "reactstrap";
import * as Yup from 'yup';
import { CSelect } from '@src/components/CSelect';
import { generateLessonYear } from '@src/utility/Utils';

const validateSchema = Yup.object().shape({
    add_score: Yup.number()
        .transform(value => (isNaN(value) ? undefined : value))
        .required("Хоосон байна"),
    lesson_year: Yup.string().trim().required("Хоосон байна"),
    lesson_season: Yup.string().trim().required("Хоосон байна"),
    description: Yup.string().trim().required("Хоосон байна"),
    lesson: Yup.string().trim().required("Хоосон байна"),
    student: Yup.string().trim().required("Хоосон байна"),
});

const EditModal = ({ open, handleModal, refreshDatas, editId }) => {

    const { t } = useTranslation()
    const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    const [ lesson_option, setLessonOption] = useState([])

    const [select_student, setStudentOption] = useState([])
    const [bottom_check, setBottomCheck] = useState(3)

    const [seasonOption, setSeasons] = useState([])

    const [student_search_value, setStudentSearchValue] = useState("");
    const [scroll_bottom_datas, setScrollBottomDatas] = useState([]);

    const { control, handleSubmit, reset, setError, setValue, formState: { errors } } = useForm(validate(validateSchema))

    const { cyear_name, cseason_id } =useContext(ActiveYearContext)

    // Api
    const lessonApi = useApi().study.lessonStandart
    const addScoreApi = useApi().score.add
    const permissionStudentApi = useApi().role.student
    const seasonApi = useApi().settings.season

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: true });

    //  Оюутны жагсаалт хайлтаар
    async function getStudentOption(searchValue) {
        const { success, data } = await fetchData(permissionStudentApi.getStudent(searchValue))
        if(success) {
            setStudentOption(data)
        }
    }

    //  Оюутны жагсаалт select ашигласан
    async function getSelectBottomDatas(state){
        const { success, data } = await fetchData(permissionStudentApi.getSelectStudents(state))
        if(success){
            setScrollBottomDatas((prev) => [...prev, ...data])
        }
    }

    useEffect(() => {
        getSelectBottomDatas(2)
    }, []);

    function handleStudentSelect(value){
        getStudentOption(value)
    }

    // Хичээлийн жагсаалт
    async function getLessonOption() {
        const { success, data } = await fetchData(lessonApi.getList())
        if(success) {
            setLessonOption(data)
        }
    }

    // Улирлын жагсаалт авах
    async function getSeasons() {
        const { success, data } = await fetchData(seasonApi.get())
        if (success) {
            setSeasons(data)
        }
    }

    useEffect(() => {
        getSeasons()
        getLessonOption()
    }, [])

    async function onSubmit(cdata) {
        // cdata['lesson_year'] = cyear_name
        // cdata['lesson_season'] = cseason_id
        cdata = convertDefaultValue(cdata)

        const { success, error } = await postFetch(addScoreApi.put(cdata, editId))
        if(success) {
            reset()
            handleModal()
            refreshDatas()
        } else {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in error) {
                setError(error[key].field, { type: 'custom', message:  error[key].msg});
            }
        }
    }

    async function getOneDatas() {
        if(editId) {
            const { success, data } = await fetchData(addScoreApi.getOne(editId))
            if(success) {
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                if(data === null) return
                for(let key in data) {
                    if(data[key] !== null) {
                        setValue(key, data[key])
                        if(key === 'lesson') setValue(key, data[key]?.id)
                        if(key === "student_code") {
                            getStudentOption(data[key])
                            setStudentSearchValue(data[key])
                        }
                    }  else setValue(key, '')
                }
            }
        }
    }

    useEffect(() => {
        getOneDatas()
    }, [])

    return (
        <Fragment>
            {isLoading && Loader}
            <Modal isOpen={open} toggle={handleModal} centered size='md' onClosed={handleModal}>
                <ModalHeader toggle={handleModal} >
                    <h4 className="modal-title">{t('Нэмэлт дүнгийн бүртгэл')}</h4>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Controller
                                control={control}
                                defaultValue={cyear_name}
                                name="lesson_year"
                                render={({ field: { value, onChange } }) => {
                                    return (
                                        <CSelect
                                            label={t('Хичээлийн жил')}
                                            id="lesson_year"
                                            isLoading={isLoading}
                                            options={generateLessonYear(5) || []}
                                            value={value && generateLessonYear(5).find((c) => c.id === value)}
                                            onChange={(val) => {
                                                onChange(val)
                                            }}
                                            isClearable={false}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    );
                                }}
                            />
                        </Col>
                        <Col md={12}>
                            <Controller
                                control={control}
                                defaultValue={cseason_id}
                                name="lesson_season"
                                render={({ field: { value, onChange } }) => {
                                    return (
                                        <CSelect
                                            label={t('Хичээлийн улирал')}
                                            id="lesson_season"
                                            isLoading={isLoading}
                                            options={seasonOption || []}
                                            value={value && seasonOption.find((c) => c.id === value)}
                                            onChange={(val) => {
                                                onChange(val)
                                            }}
                                            isClearable={false}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.season_name}
                                        />
                                    );
                                }}
                            />
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="student">
                                {t("Оюутан")}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="student"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="student"
                                            id="student"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', {'is-invalid': errors.student})}
                                            placeholder={`Хайх`}
                                            isLoading={isLoading}
                                            loadingMessage={() => "Түр хүлээнэ үү..."}
                                            options={
                                                student_search_value.length === 0
                                                    ? scroll_bottom_datas || []
                                                    : select_student || []
                                            }
                                            value={
                                                student_search_value.length === 0
                                                    ? scroll_bottom_datas.find((c) => c.id === value)
                                                    : select_student.find((c) => c.id === value)
                                            }
                                            noOptionsMessage={() =>
                                                student_search_value.length > 1
                                                    ? t('Хоосон байна')
                                                    : null
                                            }
                                            onMenuScrollToBottom={() => {
                                                if(student_search_value.length === 0){
                                                    setBottomCheck(bottom_check + 1)
                                                    getSelectBottomDatas(bottom_check)
                                                }
                                            }}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            onInputChange={(e) => {
                                                setStudentSearchValue(e);
                                                if(e.length > 1 && e !== student_search_value){
                                                    handleStudentSelect(e);
                                                } else if (e.length === 0){
                                                    setStudentOption([]);
                                                }
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.full_name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.student && <FormFeedback className='d-block'>{t(errors.student.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="lesson">
                                {t("Хичээл")}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="lesson"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="lesson"
                                            id="lesson"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.lesson })}
                                            isLoading={isLoading}
                                            placeholder={t(`Хичээл сонгоно уу`)}
                                            options={lesson_option|| []}
                                            value={lesson_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.full_name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.lesson && <FormFeedback className='d-block'>{t(errors.lesson.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="add_score">
                                {t("Нэмэлт оноо")}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="add_score"
                                name="add_score"
                                render={({ field }) => (
                                    <Input
                                        id ="add_score"
                                        bsSize="sm"
                                        placeholder={t('оноо')}
                                        {...field}
                                        type="number"
                                        onKeyDown={(e) =>["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                                        invalid={errors.add_score && true}
                                    />
                                )}
                            />
                            {errors.add_score && <FormFeedback className='d-block'>{t(errors.add_score.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="description">
                                {t("Тайлбар")}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="description"
                                name="description"
                                render={({ field }) => (
                                    <Input
                                        id ="description"
                                        bsSize="sm"
                                        placeholder={t('Тайлбар')}
                                        {...field}
                                        type="textarea"
                                        invalid={errors.description && true}
                                    />
                                )}
                            />
                            {errors.description && <FormFeedback className='d-block'>{t(errors.description.message)}</FormFeedback>}
                        </Col>
                        <Col md={12} className="mt-2">
                            <Button className="me-2" color="primary" type="submit" disabled={postLoading}>
                                {postLoading &&<Spinner size='sm' className='me-1'/>}
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" type="reset" outline  onClick={handleModal}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
    );
};
export default EditModal;
