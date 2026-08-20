import { forwardRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Select from 'react-select'

import useLoader from '@src/utility/hooks/useLoader'
import { ReactSelectStyles } from '@utils'

/**
 * @param getApi required structure: "(pageLocal, searchTextLocal, recordsLimitPerPageLocal) => ...". Example value: (pageLocal, searchTextLocal, recordsLimitPerPageLocal) => studentApi.get(recordsLimitPerPageLocal, pageLocal, '', searchTextLocal)
 * @param getOptionValue required structure: "(option) => ...". Example value: (option) => option.id
 * @param getOptionLabel required structure: "(option) => ...". Example value: (option) => `${option.code} ${option.last_name?.charAt(0)}. ${option.first_name}`
 * ver. 20260315
 */
const ScrollSelectFilter = forwardRef(({
    name,
    getApi,
    getOptionValue,
    getOptionLabel,
    isMulti,
    className = 'react-select',
    recordsLimitPerPage = 15,
    onChange,
    deps = [],
    ...rest
}, ref) => {
    const { t } = useTranslation()
    const { isLoading, fetchData } = useLoader({})
    const [options, setOptions] = useState([])

    async function getOptions(pageLocal) {
        if (pageLocal === 1 || pageLocal <= totalPages) {
            const { success, data } = await fetchData(getApi(pageLocal, searchText ?? '', recordsLimitPerPage))

            if (success) {
                if (pageLocal === 1) {
                    setOptions(data.results)
                    setPage(1)
                } else {
                    // scrolling
                    setOptions((prev) => [...prev, ...data.results])
                }

                setTotalPages(Math.ceil(data.count / recordsLimitPerPage))
            }
        }
    }

    // #region scrolling
    const [page, setPage] = useState(1)

    useEffect(() => {
        if (page > 1) getOptions(page)
    }, [page])
    // #endregion

    // #region searching
    const [searchText, setSearchText] = useState()

    // to update actual count after filters. e.g. searching. To stop getting data after reaching end of records, otherwise record will be duplicated
    const [totalPages, setTotalPages] = useState(0)

    useEffect(() => {
        if (searchText !== undefined) {
            const timeoutId = setTimeout(() => {
                getOptions(1)
            }, 1000)

            return () => {
                clearTimeout(timeoutId)
            }
        }
    }, [searchText])
    // #endregion

    useEffect(() => {
        getOptions(1)
    }, deps)

    return (
        <Select
            {...rest}
            ref={ref}
            id={name}
            name={name}
            isClearable
            classNamePrefix='select'
            className={className}
            placeholder={t(`-- Сонгоно уу --`)}
            options={options || []}
            noOptionsMessage={() => t('Хоосон байна')}
            onChange={onChange}
            loadingMessage={() => t('Түр хүлээнэ үү') + '...'}
            styles={ReactSelectStyles}
            isLoading={isLoading}
            getOptionValue={getOptionValue}
            getOptionLabel={getOptionLabel}
            isMulti={isMulti}
            // scrolling
            onMenuScrollToBottom={() => {
                if (page + 1 <= totalPages) setPage(page + 1)
            }}
            // searching
            onInputChange={(text) => {
                if (text) setSearchText(text)
                else if (searchText) setSearchText('')
            }}
        />
    )
})

ScrollSelectFilter.displayName = 'ScrollSelectFilter'
export default ScrollSelectFilter
