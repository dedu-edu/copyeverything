import React, { useState, useEffect } from 'react'
import { Controller } from 'react-hook-form'
import useLoader from '@hooks/useLoader';
import Select from 'react-select'
import classnames from 'classnames'
import { ReactSelectStyles } from '@utils'
import { t } from 'i18next';


/**
 * Select input with: controller; react-hook-form control, errors;  lazy load by scroll; timeouted searching; getting data from api
 * @param getApiArgs array - arguments (for getApi) after "limit, page, sort, search" arguments e.g. [school, department, etc]
 */
const InputSelectDatas = ({ name, control, errors, isDisabled = false, getApi, getApiArgs = [], labelPattern }) => {
	const { isLoading, fetchData } = useLoader({ isFullScreen: false })

	// main options
	const [scrollOption, setScrollOption] = useState([]);

	// search result options
	const [searchOption, setSearchOption] = useState([])
	const [searchValue, setSearchValue] = useState([]);

	// scrolling states
	const [page, setPage] = useState(1);
	const [pageCount, setPageCount] = useState(null);
	const [rowsLimit, setRowsLimit] = useState(15);

	async function getDatas(page = 1) {
		let limit = 1

		if (searchValue.length === 0) {
			limit = rowsLimit
		} else {
			page = 1
			limit = 100000
		}

		if (page <= pageCount || pageCount === null) {
			const { success, data } = await fetchData(getApi(limit, page, '', searchValue, ...getApiArgs))

			if (success) {
				if (searchValue.length === 0) {
					if (page === 1) {
						setScrollOption(data?.results)
					} else {
						setScrollOption((prev) => [...prev, ...data?.results])
					}

					if (pageCount === null) {
						const pageCount = Math.ceil(data?.count / rowsLimit)
						setPageCount(pageCount)
					}
				} else {
					setSearchOption(data?.results)
				}
			}
		}
	}

	// overload protection
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			if (searchValue.length > 1) {
				getDatas(1);
			}
		}, 1000);

		return () => {
			clearTimeout(timeoutId)
		}
	}, [searchValue])

	// options scrolling
	useEffect(() => {
		getDatas(page);
	}, [page])

	// options scrolling - getApiArgs өөрчлөгдөхөд reset хийх
	useEffect(() => {
		setPage(1);
		setPageCount(null);
		setScrollOption([]);
		getDatas(1);
	}, [...getApiArgs])

	return (
		<Controller
			defaultValue=''
			control={control}
			name={name}
			render={({ field }) =>
				<Select
					{...field}
					name={field.name}
					id={field.name}
					classNamePrefix='select'
					isClearable
					className={classnames('react-select', { 'is-invalid': errors[field.name] && true })}
					isLoading={isLoading}
					placeholder={t('-- Сонгоно уу --')}
					noOptionsMessage={() => t('Хоосон байна')}
					isDisabled={isDisabled}
					readOnly={isDisabled}
					styles={ReactSelectStyles}
					getOptionValue={(option) => option.id}
					getOptionLabel={(option) => {
						if (!option) return '';
						
						if (labelPattern === 1) {
							const lastName = option.last_name?.charAt(0) ?? '';
							const firstName = option.first_name ?? '';
							const full_name = option.full_name ?? '';
							const code = option.code ?? '';
							return `${code} ${full_name} ${lastName}. ${firstName}`.trim();
						}
						return option.name ?? '';
					}}
					options={
						searchValue.length === 0
							? scrollOption || []
							: searchOption || []
					}
					onMenuScrollToBottom={() => {
						if (searchValue.length === 0) {
							if (page <= pageCount) {
								setPage(page + 1)
							}
						}
					}}
					onInputChange={(value) => {
						setSearchValue(value);
						if (value.length === 0) {
							setSearchOption([]);
						}
					}}
				/>
			}
		/>
	)
}

export default InputSelectDatas

