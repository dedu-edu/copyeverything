import { Fragment } from 'react'

import { Label } from 'reactstrap'

import { ReactSelectStyles } from '@utils'

import Select from 'react-select'

import classnames from 'classnames';

export const CSelect = props => {
    const {
        id="name",
        label,
        options,
        value='',
        error='',
        onChange='',
        loading=false,
        isLoading=false,
        disabled=false,
        isClearable=true,
        ...otherProps
    } = props

    return (
        <Fragment key={id}>
            {
                label &&
                <Label>{label}</Label>
            }
            <Select
                id={id}
                {...otherProps}
                className={classnames('text-start react-select', { 'is-invalid': error ? (typeof error === 'boolean') ? error : Boolean(error) : false })}
                isClearable={isClearable}
                isLoading={loading || isLoading}
                classNamePrefix='select'
                placeholder={`-- Сонгоно уу --`}
                options={options || []}
                value={(value ? value : options?.find((c) => c?.id === value)) || ""}
                noOptionsMessage={() => 'Хоосон байна'}
                onChange={(val) => {
                    let value = val?.id
                    if(!val) {
                        value = ""
                    }
                    onChange(value, val)
                }}
                menuPlacement='auto'
                isDisabled={disabled}
                styles={ReactSelectStyles}
            />
        </Fragment>
    )
}
