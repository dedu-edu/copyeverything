import { t } from 'i18next';
import { Trash2 } from 'react-feather'
import { Badge, Input } from 'reactstrap';

import useModal from "@hooks/useModal"
import { CSelect } from '@src/components/CSelect';

export function getQuestionColumns(handleDeleteQuestion, difficultyLevelsOption, questionSearch, setQuestionSearch, groupSearch, setGroupSearch, hasGroupOption, setHasGroup, hasGroup) {

    const { showWarning } = useModal()

    const styles = {
        wrap: true,
        center: true,
        maxWidth: '80px'
    }

    const columns = [
        {
            ...styles,
            name: "№",
			selector: (row, index) => index + 1,
            minWidth: "50px",
			maxWidth: "50px",
        },
        {
            ...styles,
            name: (
                <div className='d-flex flex-column w-100 py-50' style={{ gap: '4px' }}>
                    <span title='Бүлэг'>{t('Бүлэг')}</span>
                    <CSelect
                        id="has_group"
                        options={hasGroupOption}
                        onChange={(val, values) => { setHasGroup(values) }}
                        menuPosition="fixed"
                        value={hasGroup}
                        isClearable={false}
                        getOptionValue={(option) => option.id}
                        getOptionLabel={(option) => option.name}
                        placeholder={`-- ${t('Сонгоно уу')} --`}
                    />
                    <Input
                        bsSize='sm'
                        placeholder={t('Хайх')}
                        value={groupSearch || ''}
                        onChange={e => setGroupSearch(e.target.value)}
                        onClick={e => e.stopPropagation()}
                        style={{ minWidth: '80px', fontWeight: 'normal', textTransform: 'none' }}
                    />
                </div>
            ),
            maxWidth: '180px',
            selector: (row) => <span className='text-center' style={{ marginTop: '3px', marginBottom: '3px' }}>{row?.question_group_name}</span>,
        },
        {
            ...styles,
            name: (
                <div className='d-flex flex-column w-100 py-50' style={{ gap: '4px' }}>
                    <span>Асуулт</span>
                    <Input
                        bsSize='sm'
                        placeholder={t('Хайх')}
                        value={questionSearch || ''}
                        onChange={e => setQuestionSearch(e.target.value)}
                        onClick={e => e.stopPropagation()}
                        style={{ minWidth: '80px', fontWeight: 'normal', textTransform: 'none' }}
                    />
                </div>
            ),
            selector: (row) => <span className='text-center' style={{ marginTop: '3px', marginBottom: '3px' }}>{row?.question}</span>,
            maxWidth: '350px'
        },
        {
            ...styles,
            name: <span title='Онлайн асуулт сан' style={{}}>CLO</span>,
            selector: (row) => <span className='text-center' style={{ marginTop: '3px', marginBottom: '3px' }}>{row?.title}</span>,
        },
        {
            ...styles,
            name: <span className='text-center' style={{ marginTop: '3px', marginBottom: '3px' }}>Асуултын түвшин</span>,
            selector: (row) => difficultyLevelsOption.find(item => item.id === row?.level)?.name,
        },
        {
            ...styles,
            name: <span className='text-center' style={{ marginTop: '3px', marginBottom: '3px' }}>Асуултын оноо</span>,
            selector: (row) => row?.score,
        },
        {
            ...styles,
            name: `${'Устгах'}`,
            selector: (row) => (
                <div className="text-center" style={{ width: "auto" }}  >
                    <a
                        role='button'
                        className='ms-1'
                        onClick={() => showWarning({
                            header: {
                                title: `Шалгалтын асуултыг устгах`,
                            },
                            question: `Уг асуултыг шалгалтнаас хасахад итгэлтэй байна уу?`,
                            onClick: () => handleDeleteQuestion(row?.id),
                            btnText: 'Устгах',
                        })}
                        id={`complaintListDatatableCancel${row?.id}`}
                    >
                        <Badge color="light-danger" pill><Trash2 width={"15px"} /></Badge>
                    </a>
                </div>
            ),
        }
    ]
    return columns
}
