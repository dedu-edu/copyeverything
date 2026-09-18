import { forwardRef, Fragment, useEffect, useRef } from 'react'

import { Label } from 'reactstrap'

import classnames from 'classnames';

import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

const quillOpts = {
	modules: {
		toolbar: [
			[{ font: [] }],
			[{ size: ['small', false, 'large', 'huge'] }],
			['bold', 'italic', 'underline', 'strike'],
			[{ color: [] }, { background: [] }],
			[{ script: 'sub' }, { script: 'super' }],
			[{ header: 1 }, { header: 2 }],
			['blockquote', 'code-block'],
			[{ list: 'ordered' }, { list: 'bullet' }],
			[{ indent: '-1' }, { indent: '+1' }],
			[{ direction: 'rtl' }],
			[{ align: [] }],
			['link'],
			['formula'],
			['clean'],
		],
	},
	formats: [
		'font',
		'header',
		'size',
		'color',
		'background',
		'align',
		'bold',
		'italic',
		'underline',
		'strike',
		'script',
		'list',
		'bullet',
		'indent',
		'blockquote',
		'code-block',
		'link',
		'image',
		'video',
		'clean',
	],
}

export const CReactQuill = forwardRef((props, ref) => {
    const {
        id = 'name',
        label,
        value = '',
        error = '',
        onChange,
        loading = false,
        disabled = false,
        theme = 'snow',
        placeholder = '',
        ...rest
    } = props

    const unprivilegedEditor = useRef(null)

    useEffect(() => {
        if (ref?.current) {
            const editor = ref.current.getEditor()
            unprivilegedEditor.current =
            ref.current.makeUnprivilegedEditor(editor)
        }
    }, [ref])

    return (
        <Fragment key={id}>
            {label && <Label>{label}</Label>}

            <ReactQuill
                {...rest}
                ref={ref}
                id={id}
                theme={theme}
                value={value}
                onChange={(val) =>
                    onChange(val === '<p><br></p>' ? '' : val)
                }
                modules={quillOpts.modules}
                formats={quillOpts.formats}
                placeholder={placeholder}
                readOnly={disabled || loading}
                className={classnames('custom-quill', {
                    'is-invalid': error
                })}
            />
        </Fragment>
    )
})