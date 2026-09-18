import classnames from "classnames";
import React, { Fragment, useEffect,useState } from "react";
import DataTable from "react-data-table-component";
import { Info, Lock, Plus, Search, Trash2 } from "react-feather";
import { Controller,useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link,useParams } from "react-router-dom";
import Select from "react-select";
import {
    Button,
    Card,
    CardHeader,
    CardTitle,
    Col,
    Form,
    Input,
    Row,
    UncontrolledTooltip,
} from "reactstrap";

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import useModal from "@src/utility/hooks/useModal";
import { get_leveltype } from "@src/utility/Utils";
import { convertDefaultValue, getPagination, ReactSelectStyles } from "@utils";

import AddQuestion from "./AddQuestion";
import { getColumns } from "./helpers";
import QuestionGroupModal from "./QuestionGroupModal";
import { getQuestionColumns } from "./QuestionHelpers";
import StudentQuestion from "./StudentQuestion";

function AddStudent() {

    const status = []
    const { t } = useTranslation();
    const { showWarning } = useModal()

    const { isLoading, fetchData, Loader } = useLoader({});
    const { isLoading: isLoadingQuestion, fetchData: fetchQuestion } = useLoader({});
    const { isLoading: isLoadingStudents, fetchData: fetchStudents } = useLoader({});
    const { isLoading: isLoadingStudentOptions, fetchData: fetchStudentOptions } = useLoader({});
    const { control, handleSubmit, setError } = useForm({});
    const { challenge_id, lesson_id } = useParams();

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(100);
    const [total_count, setTotalCount] = useState(1);
    const [searchValue, setSearchValue] = useState();

    const [datas, setDatas] = useState([]);
    const [students, setStudents] = useState([]);
    const [challengeData, setChallengeData] = useState({})
    const isStarted = challengeData?.start_date && new Date() >= new Date(challengeData.start_date)

    const [selectedRows, setSelectedRows] = useState([])
    const [toggledClearRows, setToggleClearRows] = useState(false);

    const [question_datas, setQuestionData] = useState([]);
    const [question_count, setQuestionCount] = useState('')
    const [challenge_count, setChallengeCount] = useState('')
    const [questionSearch, setQuestionSearch] = useState('');
    const [groupSearch, setGroupSearch] = useState('');

    const [modal, setModal] = useState(false);
    const [questionGroupModal, setQuestionGroupModal] = useState(false)
    const [studentQuestionModal, setStudentQuestionModal] = useState(false)

    const [student_search_value, setStudentSearchValue] = useState([]);
	const [difficultyLevelsOption] = useState(get_leveltype())

    const hasGroupOption = [
        { id: 1, name: 'Бүгд' },
        { id: 2, name: 'Бүлэгтэй' },
        { id: 3, name: 'Бүлэггүй' },
    ]

	const [hasGroup, setHasGroup] = useState(hasGroupOption[0])

    const challengeAPI = useApi().challenge;

    async function getDatas() {

        const { success, data } = await fetchStudents(challengeAPI.getAddStudent(currentPage, rowsPerPage, searchValue, challenge_id));
        if (success) {
            setDatas(data?.results);
            setTotalCount(data?.count);
        }
    };

    async function getStudents() {
        const { success, data } = await fetchStudentOptions(challengeAPI.getStudents(student_search_value));
        if (success) {
            setStudents(data)
        }
    }

    async function getQuestionTableData() {
        const { success, data } = await fetchQuestion(challengeAPI.getQuestionList(challenge_id, 'Бүгд', 1, '', hasGroup.name))
        if (success) {
            setQuestionCount(data.question_count)
            setChallengeCount(data.challenge_question_count)
            setQuestionData(data.questions)
        }
    }

    async function getChallengeData()
    {
        const { success, data } = await fetchData(challengeAPI.getDetailOne(challenge_id))
        if(success)
        {
            setChallengeData(data)
        }
    }

    async function handleDelete(id) {
        const { success } = await fetchData(challengeAPI.deleteStudent(id, challenge_id));
        if (success) {
            getDatas();
        }
    };

    async function handleDeleteQuestion(id) {
        const { success } = await fetchData(challengeAPI.deleteLevelCount(id, challenge_id));
        if (success) {
            getQuestionTableData();
        }
    };

    async function handleDeleteAll() {
        let cdatas = {
            'ids': selectedRows.map((rows) => rows?.id),
            'challenge_id': challenge_id
        }
        const { success } = await fetchData(challengeAPI.deleteTest(cdatas));
        if (success) {
            getQuestionTableData();
            setSelectedRows([])
            setToggleClearRows(current => !current);
        }
    };

    async function deleteFromGroups() {
        let cdatas = {
            'ids': selectedRows.map((rows) => rows?.id),
            'challenge_id': challenge_id
        }

        const { success } = await fetchData(challengeAPI.semester.deleteFromQuestionGroup(cdatas));

        if (success) {
            getQuestionTableData();
            setSelectedRows([])
            setToggleClearRows(current => !current);
        }
    };

    useEffect(() => {
        getDatas()
    }, [currentPage, rowsPerPage])

    useEffect(() => {
        getQuestionTableData()
        getChallengeData()
    }, [])


    function handleFilter(e) {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

    function handleSearch() {
        getDatas()
    }

    function handleStudentSelect() {
        getStudents()
    }

    const handlePagination = (page) => {
        setCurrentPage(page.selected + 1);
    };

    const handleModal = () => {
        setModal(!modal);
    };

    const showStudentQuestions = (studentId) => {
        setStudentQuestionModal(studentId)
    }

    async function onSubmitStudent(cdata) {
        cdata["challenge"] = challenge_id
        cdata = convertDefaultValue(cdata)
        const { success, error } = await fetchData(challengeAPI.putTest(cdata))
        if (success) {
            getDatas()
        }
        else {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in error) {
                setError(error[key].field, { type: 'custom', message: error[key].msg });
            }
        }
    }

    async function assignQuestions() {
        const { success } = await fetchData(challengeAPI.semester.assignQuestionsToStudents(challenge_id))
        if (success) getDatas()
    }

    useEffect(
        () => {
            if (searchValue === undefined) return
            if (searchValue.length === 0) {
                getDatas()
            }
        },
        [searchValue]
    )

    if (question_datas.length > 0) {
        for (let idx = 0; question_datas.length > idx; idx++) {
            status.push(question_datas[idx]?.status)
        }
    }

    const filteredQuestionData = question_datas.filter(item => {
        const matchQuestion = !questionSearch || (item?.question || '').toLowerCase().includes(questionSearch.toLowerCase());
        const matchGroup = !groupSearch || (item?.question_group_name || '').toLowerCase().includes(groupSearch.toLowerCase());

        let selectedHasGroup = true
        if (hasGroup.name === 'Бүлэгтэй') selectedHasGroup = !!item.question_group_name
        else if (hasGroup.name === 'Бүлэггүй') selectedHasGroup = !item.question_group_name
        return matchQuestion && matchGroup && selectedHasGroup;
    });

    function onSelectedRowsChange(state) {
        const selectedIds = new Set(state.selectedRows.map(item => item.id))
        const visibleIds = new Set(filteredQuestionData.map(item => item.id))

        const hiddenSelected = selectedRows.filter(
            item => !visibleIds.has(item.id)
        )

        const visibleSelected = question_datas.filter(
            item => selectedIds.has(item.id)
        )

        const newSelected = [
            ...hiddenSelected,
            ...visibleSelected
        ]

        const prev = new Set(selectedRows.map(item => item.id))

        const changed =
            prev.size !== newSelected.length ||
            newSelected.some(item => !prev.has(item.id))

        if (changed) {
            setSelectedRows(newSelected)
        }
    }

    return (
        <Fragment>
            {isLoading && Loader}
            <Row className="mt-2">
                <Col md={5}>
                    <Card xs={4}>
                        <CardHeader className="rounded border d-flex flex-row">
                            <Button
                                size="sm"
                                tag={Link}
                                to="/challenge-season"
                                color="primary"
                                className="btn-sm-block"
                            >
                                {t('Буцах')}
                            </Button>
                            <CardTitle tag='h4' className="mt-0 mx-0">
                                {t('Шалгалт өгөх суралцагчийг нэмэх')}
                            </CardTitle>
                        </CardHeader>
                        <Row className="m-0">
                            <Col md={12} className="p-0">
                                <Form onSubmit={handleSubmit(onSubmitStudent)}>
                                    <div className='added-cards mb-0'>
                                        <div className={classnames('cardMaster p-1 rounded border')}>
                                            <div className='content-header mb-2 mt-1 text-center'>
                                                <h4 className='content-header'>Оюутныг кодоор сонгох</h4>
                                            </div>
                                            <Col md={12} className="my-2">
                                                <Controller
                                                    defaultValue=''
                                                    control={control}
                                                    name="student"
                                                    render={({ field: { value, onChange } }) => {
                                                        return (
                                                            <Select
                                                                id="student"
                                                                name="student"
                                                                isLoading={isLoadingStudentOptions}
                                                                classNamePrefix='select'
                                                                className='react-select'
                                                                placeholder={`Хайх`}
                                                                options={students || []}
                                                                value={students.find((c) => c.id === value)}
                                                                noOptionsMessage={() => 'Хоосон байна'}
                                                                onChange={(val) => {
                                                                    onChange(val?.code)
                                                                }}
                                                                onInputChange={(e) => {
                                                                    setStudentSearchValue(e);
                                                                    if (student_search_value.length > 1) {
                                                                        handleStudentSelect();
                                                                    } else if (student_search_value.length === 0) {
                                                                        setStudents([]);
                                                                    }
                                                                }}
                                                                styles={ReactSelectStyles}
                                                                getOptionValue={(option) => option.id}
                                                                getOptionLabel={(option) => `${option.code} ${option.full_name}`}
                                                            />
                                                        );
                                                    }}
                                                />
                                            </Col>
                                            <div className="text-center">
                                                <Button
                                                    size="sm"
                                                    className="me-0 mt-1 text-end"
                                                    color="primary"
                                                    type="submit"
                                                >
                                                    {t("Хадгалах")}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Form>
                            </Col>
                        </Row>
                    </Card>
                </Col>
                <Col md={7}>
                    <Card md={3}>
                        <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
                            <CardTitle tag="h4" className="mt-50 ">{t("Асуулт нэмэх")}</CardTitle>
                            <div className="d-flex flex-wrap mt-md-0 mt-1 gap-1">
                                {/* {isStarted ? (
                                    <div className="d-flex align-items-center gap-50 px-1 py-50 rounded" style={{ backgroundColor: '#fff3cd', border: '1px solid #ffc107', color: '#856404' }}>
                                        <Lock size={14} />
                                        <small className="fw-bold">{t("Шалгалт эхэлсэн бол үйлдэл хийх боломжгүй")}</small>
                                    </div>
                                ) : ( */}
                                    <>
                                        <Button
                                            size="sm"
                                            color="danger"
                                            onClick={() => showWarning({
                                                header: {
                                                    title: t('Бүлгүүдээс устгах'),
                                                },
                                                question: t(`Та сонгогдсон асуултуудыг бүлгүүдээс устгахдаа итгэлтэй байна уу?`),
                                                onClick: () => deleteFromGroups(),
                                                btnText: t('Устгах'),
                                            })}
                                            disabled={!selectedRows?.length}
                                        >
                                            <Trash2 size={15} />
                                            <span className="align-middle ms-50">
                                                {t("Бүлгүүдээс устгах")} ({selectedRows.length})
                                            </span>
                                        </Button>
                                        <Button
                                            size="sm"
                                            color="primary"
                                            onClick={() => setQuestionGroupModal(true)}
                                            disabled={!selectedRows?.length}
                                        >
                                            <Plus size={15} />
                                            <span className="align-middle ms-50">
                                                {t("Бүлэг нэмэх")} ({selectedRows.length})
                                            </span>
                                        </Button>
                                        <span id="group-info-icon" className="d-flex align-items-center cursor-pointer text-muted">
                                            <Info size={16} />
                                        </span>
                                        <UncontrolledTooltip placement="bottom" target="group-info-icon">
                                            {t("Бүлэглэх асуултуудаа сонгоод Бүлэг нэмэх товч дээр дарж бүлэглэнэ")}
                                        </UncontrolledTooltip>
                                        <Button
                                            size="sm"
                                            color="danger"
                                            onClick={() => showWarning({
                                                header: {
                                                    title: t('Асуулт устгах'),
                                                },
                                                question: t(`Та сонгогдсон асуултуудыг устгахдаа итгэлтэй байна уу?`),
                                                onClick: () => handleDeleteAll(),
                                                btnText: t('Устгах'),
                                            })}
                                            disabled={!selectedRows?.length}
                                        >
                                            <Trash2 size={15} />
                                            <span className="align-middle ms-50">
                                                {t('Устгах')} ({selectedRows.length})
                                            </span>
                                        </Button>
                                        <Button
                                            size="sm"
                                            color="primary"
                                            onClick={() => handleModal()}
                                        >
                                            <Plus size={15} />
                                            <span className="align-middle ms-50">
                                                {t("Нэмэх")}
                                            </span>
                                        </Button>
                                    </>
                                {/* )} */}
                            </div>
                            <div className="mt-1">
                                {t('Нийт асуултын тоо')}: {question_count}<br />
                                {t('Оюутан бүрийн асуултын тоо')}: {challenge_count}<br />
                            </div>
                        </CardHeader>
                        <div className="mx-50 rounded border my-50">
                            <DataTable
                                noHeader
                                persistTableHead
                                progressPending={isLoadingQuestion}
                                progressComponent={
                                    <div className="my-2">
                                        <h5>{t("Түр хүлээнэ үү...")}</h5>
                                    </div>
                                }
                                noDataComponent={
                                    <div className="mb-2" style={{ marginTop: '27px' }}>
                                        <h5>{t("Асуулт байхгүй байна")}</h5>
                                    </div>
                                }
                                columns={getQuestionColumns(
                                    handleDeleteQuestion,
                                    difficultyLevelsOption,
                                    questionSearch,
                                    setQuestionSearch,
                                    groupSearch,
                                    setGroupSearch,
                                    hasGroupOption,
                                    setHasGroup,
                                    hasGroup,
                                )}
                                data={filteredQuestionData}
                                selectableRows
                                onSelectedRowsChange={(state) => onSelectedRowsChange(state)}
                                selectableRowSelected={(row) => selectedRows.some(item => item.id === row.id)}
                                clearSelectedRows={toggledClearRows}
                                fixedHeader
                                fixedHeaderScrollHeight="62vh"
                                customStyles={{
                                    table: {
                                        style: {},
                                    },
                                    header: {
                                        style: {},
                                    },
                                    headRow: {
                                        style: {
                                            color: "#6e6b7b",
                                            fontWeight: "700",
                                            backgroundColor: "#f3f2f7",
                                            textTransform: 'uppercase'
                                        },
                                    },
                                    headCells: {
                                        style: {
                                            paddingLeft: '8px',
                                            paddingRight: '8px',
                                        },
                                    },
                                    rows: {
                                        style: {
                                            color: "#000001"
                                        },
                                    },
                                    cells: {
                                        style: {
                                            paddingLeft: '8px',
                                            paddingRight: '8px',
                                        },
                                    },
                                }}
                            />
                        </div>
                    </Card>
                </Col>
            </Row>
            <Card md={12}>
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
                    <CardTitle tag="h4">{t("Шалгалт өгөх оюутнуудын жагсаалт")}</CardTitle>
                </CardHeader>
                <Row className='mt-2 my-1 mx-1 align-items-center'>
                    <Col>
                        <Button
                            size="sm"
                            color="primary"
                            onClick={() => showWarning({
                                header: {
                                    title: t('Асуултуудыг тараах'),
                                },
                                question: t(`Асуултуудыг тараахдаа итгэлтэй байна уу?`),
                                onClick: () => assignQuestions(),
                                btnText: t('Үргэлжлүүлэх'),
                            })}
                        >
                            <Plus size={15} />
                            <span className="align-middle ms-50">
                                {t("Асуултуудыг тараах")}
                            </span>
                        </Button>
                    </Col>
                    <Col className='d-flex align-items-center mobile-datatable-search'>
                        <Input
                            className='dataTable-filter mb-50'
                            type='text'
                            bsSize='sm'
                            id='search-input'
                            placeholder={t('Хайх')}
                            onChange={handleFilter}
                            onKeyPress={e => e.key === 'Enter' && handleSearch()}
                        />
                        <Button
                            size='sm'
                            className='ms-50 mb-50'
                            color='primary'
                            onClick={handleSearch}
                        >
                            <Search size={15} />
                            <span className='align-middle ms-50'></span>
                        </Button>
                    </Col>
                </Row>
                <div className="react-dataTable react-dataTable-selectable-rows">
                    <DataTable
                        noHeader
                        pagination
                        className="react-dataTable"
                        progressPending={isLoadingStudents}
                        progressComponent={
                            <div className="my-2">
                                <h5>{t("Түр хүлээнэ үү...")}</h5>
                            </div>
                        }
                        noDataComponent={
                            <div className="my-2">
                                <h5>{t("Өгөгдөл байхгүй байна")}</h5>
                            </div>
                        }
                        columns={getColumns(
                            currentPage,
                            rowsPerPage,
                            total_count,
                            handleDelete,
                            showStudentQuestions,
                        )}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        data={datas}
                        paginationComponent={getPagination(
                            handlePagination,
                            currentPage,
                            rowsPerPage,
                            total_count,
                        )}
                        fixedHeader
                        fixedHeaderScrollHeight="62vh"
                    />
                </div>
                {modal && (
                    <AddQuestion
                        open={modal}
                        handleModal={handleModal}
                        refreshDatas={getDatas}
                        lesson={lesson_id}
                        challenge={challenge_id}
                        refreshQuestionData={getQuestionTableData}
                        status={status}
                    />
                )}
                {!!questionGroupModal && <QuestionGroupModal
                    open={questionGroupModal}
                    handleModal={() => { setQuestionGroupModal(false) }}
                    refreshDatas={() => { getQuestionTableData() }}
                    challengeId={challenge_id}
                    selectedQuestionIds={selectedRows.map(item => item.id)}
                />}
                {!!studentQuestionModal && <StudentQuestion
                    open={studentQuestionModal}
                    handleModal={() => { setStudentQuestionModal(null) }}
                    challengeId={challenge_id}
                />}
            </Card>
        </Fragment>
    )
} export default AddStudent;