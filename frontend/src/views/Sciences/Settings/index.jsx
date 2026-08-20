import { useEffect, useState } from 'react';

import {
    Card,
    CardHeader,
    CardTitle,
    Col,
    Row
} from 'reactstrap';

import { useForm } from "react-hook-form";
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { validate } from '@src/utility/Utils';

import useModal from '@src/utility/hooks/useModal';

import MainCategoryModal from './components/MainCategoryModal';
import MainCategoryBlock from './components/MainCategoryBlock';
import SubCategoryAddBlock from './components/SubCategoryAddBlock';
import SubCategoryBlock from './components/SubCategoryBlock';
import SubCategoryModal from './components/SubCategoryModal';


export default function Settings() {
    const { t } = useTranslation()

    const validationSchema = Yup.object().shape({
        category:
            Yup.object({
                id:
                    Yup.mixed()
                        .test('is-string-or-number', t('Хоосон байна'), (value) => {
                            return typeof value === 'string' || typeof value === 'number';
                        })
            })
                .nullable()
                .required(t('Хоосон байна')),
        name:
            Yup.string()
                .trim()
                .required(t('Хоосон байна')),
        score:
            Yup.number()
                .transform(value => (isNaN(value) ? undefined : value))
                .required(t('Хоосон байна'))
    });

    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
        reset,
        setError
    } = useForm(validate(validationSchema));

    // states
    const [edit, setEdit] = useState(false)

    const [subCategoryOptions, setSubCategoryOptions] = useState([])
    const [subCategoryModal, setSubCategoryModal] = useState(false)
    const [subCategoryEditData, setEditSubCategoryData] = useState({})

    const [mainCategoryOptions, setMainCategoryOptions] = useState([])
    const [mainCategoryModal, setMainCategoryModal] = useState(false);
    const [mainCategoryEditData, setMainCategoryEditData] = useState({})

    const [subCategoryCounts, setSubCategoryCounts] = useState({})

    // #region pagination
    const [subCategoryCurrentPage, setSubCategoryCurrentPage] = useState(1)
    const [subCategoryRowsPerPage, setSubCategoryRowsPerPage] = useState(10)
    const [subCategoryTotalCount, setSubCategoryTotalCount] = useState(1)

    const [mainCategoryCurrentPage, setMainCategoryCurrentPage] = useState(1)
    const [mainCategoryRowsPerPage, setMainCategoryRowsPerPage] = useState(5)
    const [mainCategoryTotalCount, setMainCategoryTotalCount] = useState(1)
    // #endregion

    const scienceApi = useApi().science
    const { isLoading, fetchData, Loader } = useLoader({ isFullScreen: true })
    const { showWarning } = useModal()
    const default_page = [5, 10, 15, 50, 75, 100]

    // for custom table
    let prevGroup = null;

    async function onSubmit(cdata) {
        const { success, error } = await fetchData(scienceApi.category.sub.post(cdata))

        if (success) {
            reset()
            setEdit(false)
            getSubCategoryOptions()

        } else if (error) {
            /** Алдааны мессэжийг input дээр харуулна */
            error.forEach(error_item => {
                const key = error_item?.field
                setError(key, { type: 'custom', message: error_item?.msg });
            })
        }
    }

    // #region subCategory
    function handleSubCategoryPerPage(e) {
        setSubCategoryRowsPerPage(e.target.value)
    }

    const handleSubCategoryPagination = (page) => {
        setSubCategoryCurrentPage(page.selected + 1);
    };

    async function handleSubCategoryDelete(id) {
        const { success } = await fetchData(scienceApi.category.sub.delete(id))

        if (success) getSubCategoryOptions()
    }

    const handleSubCategoryModal = (data) => {
        setEditSubCategoryData(data)
        setSubCategoryModal(!subCategoryModal)
    }

    const getSubCategoryOptions = async (isPageChanging) => {
        const { success, data } = await fetchData(scienceApi.category.sub.get(subCategoryRowsPerPage, subCategoryCurrentPage, 'category'))

        if (success) {
            const results = data?.results

            // to sort by order: MainCategory.order_no, MainCategory.id, SubCategory.order_no
            // to rowspan properly it's needed to group sub categories by their main categories
            results.sort((a, b) =>
                a.category.order_no - b.category.order_no ||
                a.category.id - b.category.id ||
                a.order_no - b.order_no
            ).reduce((acc, item) => {
                if (isPageChanging) item.groupIndex = acc.groupIndex + Object.keys(subCategoryCounts).length;
                else item.groupIndex = acc.groupIndex

                if (acc.lastGroup !== item.category?.id) acc.groupIndex++;
                acc.result.push(item);
                acc.lastGroup = item.category?.id;

                return acc;
            }, { result: [], groupIndex: 0, lastGroup: null }).result

            setSubCategoryOptions(results)
            setSubCategoryTotalCount(data?.count)
            setSubCategoryCounts(getSubCategpryCounts(results))
        }
    }
    // #endregion

    // #region main category
    function handleMainCategoryPerPage(e) {
        setMainCategoryRowsPerPage(e.target.value)
    }

    const handleMainCategpryPagination = (page) => {
        setMainCategoryCurrentPage(page.selected + 1);
    };

    async function handleMainCategoryDelete(id) {
        const { success } = await fetchData(scienceApi.category.delete(id))

        if (success) {
            getMainCategoryOptions()
            getSubCategoryOptions()
        }
    }

    const handleMainCategoryModal = (data) => {
        setMainCategoryEditData(data)
        setMainCategoryModal(!mainCategoryModal)
    }

    const getMainCategoryOptions = async () => {
        const { success, data } = await fetchData(scienceApi.category.get(mainCategoryRowsPerPage, mainCategoryCurrentPage, 'order_no'))

        if (success) {
            setMainCategoryOptions(data?.results)
            setMainCategoryTotalCount(data?.count)
        }
    }
    // #endregion

    useEffect(() => {
        getMainCategoryOptions()
    }, [mainCategoryCurrentPage, mainCategoryRowsPerPage])

    useEffect(() => {
        if (subCategoryCurrentPage === 1) getSubCategoryOptions()
        else getSubCategoryOptions(true)
    }, [subCategoryCurrentPage])

    useEffect(() => {
        getSubCategoryOptions()
    }, [subCategoryRowsPerPage])

    // for custom table
    const getSubCategpryCounts = (data) => {
        const counts = {};

        data.forEach((item) => {
            counts[item.category.id] = (counts[item.category.id] || 0) + 1;
        });

        return counts;
    };

    /**
     * for ReactSortable library
     * @param applyOrderApi minimal required structure: "(cdataLocal) => ...". Example value: (cdataLocal) => studentApi.applyOrder(cdataLocal)
     */
    const changeOrder = async (event, sortableItems, setSortableItems, applyOrderApi, refreshData, orderFieldName, page, limitPerPage) => {
        const { oldIndex, newIndex } = event;

        // to copy array because it is located in useState
        const updatedList = [...sortableItems];

        const [movedItem] = updatedList.splice(oldIndex, 1);
        updatedList.splice(newIndex, 0, movedItem);
        setSortableItems(updatedList);

        const cdataLocal = updatedList.map((item, index) => ({
            id: item.id,

            // to change order accordingly to pagination (current page)
            [orderFieldName]: (page - 1) * limitPerPage + index + 1,
        }));

        const { success } =  await fetchData(applyOrderApi(cdataLocal))

        if (success) {
            refreshData()
        }
    };

    return (
        <>
            {isLoading && Loader}
            <Card>
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                    <CardTitle tag='h4'>{t('Эрдэм шинжилгээний шалгуур үзүүлэлт')}</CardTitle>
                </CardHeader>
            </Card>
            <Row>
                <Col md="4">
                    <SubCategoryAddBlock
                        setEdit={setEdit}
                        edit={edit}
                        handleSubmit={handleSubmit}
                        onSubmit={onSubmit}
                        control={control}
                        errors={errors}
                        t={t}
                        isValid={isValid}
                        scienceApi={scienceApi}
                    />
                </Col>
                <Col md={8}>
                    <MainCategoryBlock
                        handleMainCategoryModal={handleMainCategoryModal}
                        mainCategoryCurrentPage={mainCategoryCurrentPage}
                        mainCategoryRowsPerPage={mainCategoryRowsPerPage}
                        mainCategoryOptions={mainCategoryOptions}
                        showWarning={showWarning}
                        handleMainCategoryDelete={handleMainCategoryDelete}
                        t={t}
                        handleMainCategoryPerPage={handleMainCategoryPerPage}
                        default_page={default_page}
                        handleMainCategoryPagination={handleMainCategpryPagination}
                        mainCategoryTotalCount={mainCategoryTotalCount}
                        setMainCategoryOptions={setMainCategoryOptions}
                        changeOrder={(event) => changeOrder(
                            event,
                            mainCategoryOptions,
                            setMainCategoryOptions,
                            (cdataLocal) => scienceApi.category.applyOrder(cdataLocal),
                            getMainCategoryOptions,
                            'order_no',
                            mainCategoryCurrentPage,
                            mainCategoryRowsPerPage
                        )}
                    />
                </Col>
            </Row>
            <Row className='mt-1'>
                <Col>
                    <SubCategoryBlock
                        t={t}
                        subCategoryOptions={subCategoryOptions}
                        prevGroup={prevGroup}
                        subCategoryCounts={subCategoryCounts}
                        subCategoryCurrentPage={subCategoryCurrentPage}
                        subCategoryRowsPerPage={subCategoryRowsPerPage}
                        handleSubCategoryModal={handleSubCategoryModal}
                        showWarning={showWarning}
                        handleSubCategoryDelete={handleSubCategoryDelete}
                        handleSubCategoryPerPage={handleSubCategoryPerPage}
                        default_page={default_page}
                        handleSubCategoryPagination={handleSubCategoryPagination}
                        subCategoryTotalCount={subCategoryTotalCount}
                        setSubCategoryOptions={setSubCategoryOptions}
                        changeOrder={(event) => changeOrder(
                            event,
                            subCategoryOptions,
                            setSubCategoryOptions,
                            (cdataLocal) => scienceApi.category.sub.applyOrder(cdataLocal),
                            getSubCategoryOptions,
                            'order_no',
                            subCategoryCurrentPage,
                            subCategoryRowsPerPage
                        )}
                    />
                </Col>
            </Row>
            {mainCategoryModal && <MainCategoryModal open={mainCategoryModal} handleModal={handleMainCategoryModal} refreshDatas={getMainCategoryOptions} editData={mainCategoryEditData} />}
            {subCategoryModal && <SubCategoryModal open={subCategoryModal} handleModal={handleSubCategoryModal} refreshDatas={getSubCategoryOptions} editData={subCategoryEditData} />}
        </>
    )
}
