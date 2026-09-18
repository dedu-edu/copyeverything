import { useRef, useState } from 'react'
import { Button, Modal, ModalBody, ModalHeader } from 'reactstrap'
import { useTranslation } from 'react-i18next'
import { Printer, Edit3 } from 'react-feather'

import SignatureModal from '../Definition/Specification/helpers/SignatureModal'

import './helpers/style.css'

function getStudentName(data) {
    const student = data?.student || data
    const lastName = student?.last_name
    const firstName = student?.first_name
    if (lastName || firstName) {
        return [lastName, firstName].filter(Boolean).join(' ')
    }
    return ''
}

function getProgramName(data) {
    const student = data?.student || data
    const profession = data?.group?.profession || student?.group?.profession
    return (
        profession?.name ||
        profession?.prof_name ||
        profession?.full_name ||
        data?.profession_name ||
        data?.dep_name ||
        ''
    )
}

function getGraduationWork(data) {
    return data?.graduation_work || data?.student?.graduation_work || {}
}

function parseDate(dateString) {
    if (!dateString) return null
    const matched = String(dateString).match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/)
    if (!matched) return null
    return {
        year: matched[1],
        month: String(matched[2]).padStart(2, '0'),
        day: String(matched[3]).padStart(2, '0')
    }
}

function ordinalSuffix(value) {
    const digits = String(value).match(/\d/g)
    if (!digits) return 'дугаар'
    const lastDigit = Number(digits[digits.length - 1])
    return [1, 4, 9].includes(lastDigit) ? 'дүгээр' : 'дугаар'
}

function genitiveSuffix(value) {
    const digits = String(value).match(/\d/g)
    if (!digits) return 'ны'
    const lastDigit = Number(digits[digits.length - 1])
    return [1, 4, 9].includes(lastDigit) ? 'ний' : 'ны'
}

const inputStyle = (bold) => ({
    border: '1px solid #bcbcbc',
    borderRadius: 3,
    outline: 'none',
    textAlign: 'center',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    fontWeight: bold ? 700 : 400,
    background: '#fff',
    padding: '0 4px',
    margin: '0 3px'
})

function Field({ value = '', width = 70, bold = false }) {
    const hasValue = value !== '' && value != null
    if (hasValue) {
        return <span style={{ fontWeight: bold ? 700 : 400 }}>{value}</span>
    }
    return <input type='text' className='cert-input' style={{ ...inputStyle(bold), width: `${width}px` }} />
}

function NumField({ value = '', width = 55, word }) {
    const [typed, setTyped] = useState('')
    const hasValue = value !== '' && value != null

    if (hasValue) {
        return <span><span>{value}</span> {ordinalSuffix(value)} {word}</span>
    }

    return (
        <span>
            <input
                type='text'
                className='cert-input'
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                style={{ ...inputStyle(false), width: `${width}px` }}
            /> {ordinalSuffix(typed)} {word}
        </span>
    )
}

function DayField({ value = '', width = 45 }) {
    const [typed, setTyped] = useState('')
    const hasValue = value !== '' && value != null

    if (hasValue) {
        return <span><span>{value}</span>-{genitiveSuffix(value)} өдрийн</span>
    }

    return (
        <span>
            <input
                type='text'
                className='cert-input'
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                style={{ ...inputStyle(false), width: `${width}px` }}
            />-{genitiveSuffix(typed)} өдрийн
        </span>
    )
}

function CertBody({ template, data }) {
    const studentName = getStudentName(data)
    const programName = getProgramName(data)
    const work = getGraduationWork(data)

    const joinYear = (data?.group?.join_year || data?.join_year || '').match(/\d{4}/)?.[0] || ''
    const diplomaNumber = work.diplom_num || data?.diplom_num || data?.deplom_num || ''
    const orderNumber = work.graduation_number || data?.graduation_number || ''

    const orderDate = parseDate(work.graduation_date || data?.graduation_date || data?.give_date)
    const orderYear = orderDate ? orderDate.year : ''
    const orderMonth = orderDate ? orderDate.month : ''
    const orderDay = orderDate ? orderDate.day : ''
    const graduateYear = orderDate ? orderDate.year : (data?.graduated_year || data?.graduate_year || '')

    switch (Number(template)) {
        case 1:
            return (
                <span>Иргэн <Field value={studentName} width={170} bold /> нь тус Их сургуульд <Field value='' width={130} /> газрын даргын <Field value='' width={55} /> оны <Field value='' width={40} /> сарын <DayField value='' width={45} /> <NumField value='' width={55} word='тушаалаар' /> “<Field value={programName} width={150} bold />” хөтөлбөрт сонсогчоор элсэн суралцаж, захирлын <Field value={orderYear} width={55} /> оны <NumField value={orderMonth} width={40} word='сарын' /> <DayField value={orderDay} width={40} /> <NumField value={orderNumber} width={60} word='тушаалаар' /> <Field value={diplomaNumber} width={115} /> дугаарын бакалаврын дипломтой төгссөн болно.</span>
            )

        case 2:
            return (
                <span>Иргэн <Field value={studentName} width={170} bold /> нь тус сургуульд <Field value={joinYear} width={55} /> - <Field value={graduateYear} width={55} /> онд “<Field value={programName} width={150} bold />” мэргэжлээр суралцаж, <Field value={diplomaNumber} width={115} /> дугаарын бакалаврын дипломтой төгссөн болно.</span>
            )

        case 3:
            return (
                <span>Иргэн <Field value={studentName} width={170} bold /> нь тус Их сургуульд <Field value='' width={130} /> газрын даргын <Field value='' width={55} /> оны <NumField value='' width={45} word='сарын' /> <DayField value='' width={45} /> <NumField value='' width={55} word='тушаалаар' /> “<Field value={programName} width={150} bold />” хөтөлбөрт сонсогчоор элсэн суралцаж (<Field value='' width={120} /> захирлын <Field value='' width={55} /> оны <NumField value='' width={45} word='сарын' /> <DayField value='' width={45} /> <NumField value='' width={55} word='тушаалаар' /> <Field value='' width={40} /> жил сургалт хойшлуулсан, <Field value='' width={55} /> оны <NumField value='' width={45} word='сарын' /> <DayField value='' width={45} /> <NumField value='' width={55} word='тушаалаар' /> <NumField value='' width={40} word='дамжаанд' /> үргэлжлүүлэн суралцуулсан), захирлын <Field value={orderYear} width={55} /> оны <NumField value={orderMonth} width={40} word='сарын' /> <DayField value={orderDay} width={40} /> <NumField value={orderNumber} width={60} word='тушаалаар' /> <Field value={diplomaNumber} width={115} /> дугаарын бакалаврын дипломтой төгссөн болно.</span>
            )

        case 4:
            return (
                <span>Иргэн <Field value={studentName} width={170} bold /> нь Их сургуулийн захирлын <Field value='' width={55} /> оны <NumField value='' width={45} word='сарын' /> <DayField value='' width={45} /> <NumField value='' width={55} word='тушаалаар' /> “<Field value={programName} width={150} bold />” хөтөлбөрт сонсогчоор элсэн суралцаж, <Field value='' width={55} /> оны <NumField value='' width={45} word='сарын' /> <DayField value='' width={45} /> <NumField value='' width={55} word='тушаалаар' /> тус Их сургуулиас чөлөөлөгдсөн болно.</span>
            )

        default:
            return null
    }
}

function SignatureBlock({ signatures }) {
    const signatureList = (signatures && signatures.length) ? signatures : []

    return (
        <div style={{ marginTop: 48 }}>
            {signatureList.length === 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ fontWeight: 600 }}>……………………</div>
                    <div style={{ fontWeight: 700 }}>……………………</div>
                </div>
            )}
            {signatureList.map((signature, index) => (
                <div
                    key={index}
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        marginTop: index ? 24 : 0
                    }}
                >
                    <div style={{ whiteSpace: 'pre-line', fontWeight: 600 }}>{signature.position_name}</div>
                    <div style={{ fontWeight: 700 }}>
                        {(signature.last_name ? signature.last_name[0] + '.' : '') + (signature.first_name || '')}
                    </div>
                </div>
            ))}
        </div>
    )
}

function CertificateModal({ isOpen, handleModal, data, template }) {
    const { t } = useTranslation()
    const [signatures, setSignatures] = useState([])
    const [isSignatureModalOpen, setSignatureModalOpen] = useState(false)
    const [selectedTemplate, setSelectedTemplate] = useState(template || 1)
    const printRef = useRef(null)

    const handlePrint = () => {
        const printArea = printRef.current
        if (!printArea) return

        const liveInputs = printArea.querySelectorAll('input')
        const clone = printArea.cloneNode(true)
        const clonedInputs = clone.querySelectorAll('input')

        clonedInputs.forEach((input, index) => {
            const value = liveInputs[index] ? liveInputs[index].value : ''
            const span = clone.ownerDocument.createElement('span')
            span.textContent = value
            span.style.fontWeight = input.style.fontWeight || '400'
            span.style.padding = '0 3px'
            input.replaceWith(span)
        })

        const printWindow = window.open('', '_blank', 'width=900,height=1100')
        if (!printWindow) return

        printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Тодорхойлолт</title>
            <style>
                @page { size: A4; margin: 25mm 25mm 25mm 30mm; }
                * { box-sizing: border-box; }
                body { font-family: 'Times New Roman', serif; font-size: 14pt; line-height: 1.9; color: #000; margin: 0; }
                .cert-title { text-align: center; font-weight: 700; letter-spacing: 2px; margin-bottom: 28px; font-size: 15pt; }
                .cert-body { text-align: justify; text-indent: 48px; }
            </style></head><body>${clone.innerHTML}</body></html>`)
        printWindow.document.close()
        printWindow.focus()
        setTimeout(() => { printWindow.print() }, 350)
    }

    return (
        <Modal isOpen={isOpen} toggle={handleModal} size='lg' className='modal-dialog-centered'>
            <ModalHeader toggle={handleModal}>
                {t('Тодорхойлолт')} — {t('Загвар')} {selectedTemplate}
            </ModalHeader>
            <ModalBody>
                {/* Загвар сонгох товчнууд */}
                <div className='d-flex flex-wrap gap-50 mb-1'>
                    {[1, 2, 3, 4].map((templateNumber) => (
                        <Button
                            key={templateNumber}
                            size='sm'
                            color='primary'
                            outline={selectedTemplate !== templateNumber}
                            onClick={() => setSelectedTemplate(templateNumber)}
                        >
                            {t('Загвар')} {templateNumber}
                        </Button>
                    ))}
                </div>

                {/* Үйлдлийн товчнууд */}
                <div className='d-flex justify-content-end gap-1 mb-1'>
                    <Button color='primary' size='sm' onClick={() => setSignatureModalOpen(true)}>
                        <Edit3 size={14} />
                        <span className='align-middle ms-50'>{t('Гарын үсэг сонгох')}</span>
                    </Button>
                    <Button color='primary' size='sm' onClick={handlePrint}>
                        <Printer size={14} />
                        <span className='align-middle ms-50'>{t('Хэвлэх')}</span>
                    </Button>
                </div>

                {/* Хэвлэх хэсэг */}
                <div
                    ref={printRef}
                    className='certificate-print-area'
                    style={{
                        background: '#fff',
                        color: '#000',
                        padding: '32px 40px',
                        border: '1px solid #e6e6e6',
                        borderRadius: 6,
                        fontFamily: "'Times New Roman', serif",
                        fontSize: '14pt',
                        lineHeight: 1.9
                    }}
                >
                    <div
                        className='cert-title'
                        style={{ textAlign: 'center', fontWeight: 700, letterSpacing: 2, marginBottom: 28, fontSize: '15pt' }}
                    >
                        ТОДОРХОЙЛОЛТ
                    </div>

                    <div
                        key={`${selectedTemplate}-${data?.id || data?.code || ''}`}
                        className='cert-body'
                        style={{ textAlign: 'justify', textIndent: 48 }}
                    >
                        <CertBody template={selectedTemplate} data={data} />
                    </div>

                    <SignatureBlock signatures={signatures} />
                </div>
            </ModalBody>

            {isSignatureModalOpen && (
                <SignatureModal
                    isOpen={isSignatureModalOpen}
                    handleModal={() => setSignatureModalOpen(false)}
                    data={data}
                    onSaved={(selected) => {
                        setSignatures(selected || [])
                        setSignatureModalOpen(false)
                    }}
                />
            )}
        </Modal>
    )
}

export default CertificateModal