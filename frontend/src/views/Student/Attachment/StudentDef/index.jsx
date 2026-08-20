import React, { useState, useEffect, useContext } from 'react'
import './style.css'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, LabelList
} from 'recharts'
import SignatureModal from '../../Definition/Specification/helpers/SignatureModal'
import useApi from '@hooks/useApi'
import useLoader from '@src/utility/hooks/useLoader'
import localforage from 'localforage'

export default function StudentDefinition({ data }) {
    const [photoUrl, setPhotoUrl] = useState(null)
    const [sigModalOpen, setSigModalOpen] = useState(false)
    const [signatures, setSignatures] = useState(
        JSON.parse(sessionStorage.getItem('signature_data') || '[]')
    )
    const [punishments, setPunishments] = useState([])

    const [resolvedData, setResolvedData] = useState(data || null)
    const [isDataLoading, setIsDataLoading] = useState(!data)

    const { isLoading, Loader, fetchData } = useLoader({ isFullScreen: true })

    const punishmentApi = useApi().student.punishment

    useEffect(() => {
        async function loadLocalData() {
            // Хэрэв prop-оос 'data' ирээгүй байвал localforage-ээс хайна
            if (!data) {
                try {
                    const localData = await localforage.getItem('studentDefData')
                    setResolvedData(localData) // Олдсон өгөгдлийг state-д хадгална
                } catch (error) {
                    console.error("IndexedDB-ээс уншихад алдаа гарлаа:", error)
                } finally {
                    setIsDataLoading(false) // Татаж дууссан
                }
            } else {
                setResolvedData(data)
                setIsDataLoading(false)
            }
        }

        loadLocalData()
    }, [data])

    async function getDatas() {
        const { success, data } = await fetchData(punishmentApi.get(resolvedData.student.id))
        if(success) {
            setPunishments(data || [])
        }
    }

    useEffect(() => {
        if (resolvedData?.student?.id) {
            getDatas()
        } else {
            setPunishments([])
        }
    }, [resolvedData?.student?.id])

    if (isDataLoading) return <Loader />
    if (!resolvedData) return null

    const student    = resolvedData?.student  || {}
    const apiProfile = resolvedData?.profile  || {}
    const isCopsSchool = student?.group?.profession?.school === 1

    const val = (v) => v || '---'
    const profile = {
        register_no:       apiProfile?.register_num,
        family_name:       apiProfile?.family_name,
        father_name:       apiProfile?.last_name,
        gender:            apiProfile?.gender === 1 ? 'M' : apiProfile?.gender === 2 ? 'F' : '',
        birthdate:         apiProfile?.birth_date,
        ethnicity:         apiProfile?.yas_undes,
        birth_place:       apiProfile?.birth_place,
        permanent_address: apiProfile?.permanent_address,
        current_address:   apiProfile?.current_address,
        phone:             apiProfile?.phone,
        email:             apiProfile?.email,
        emergency_contact: apiProfile?.emergency_contact,
        rank:              apiProfile?.rank,
        photo:             apiProfile?.photo,

        profession: {
            index:  apiProfile?.profession?.index,
            name:   apiProfile?.profession?.name,
            major:  apiProfile?.profession?.major,
            credit: apiProfile?.profession?.credit,
        },

        family_members: (resolvedData?.family_members || []).map(m => ({
            relation:    m?.member,
            full_name:   `${m?.last_name || ''} ${m?.first_name || ''}`.trim(),
            register_no: m?.register_num,
            birth_place: m?.torson_gazar,
            occupation:  m?.current_employment || m?.employment,
        })),

        trainings: (resolvedData?.trainings || []).map(t => ({
            year:           t?.year,
            name:           t?.course_name,
            period:         t?.elssen_togsson_year,
            degree:         t?.degree_level,
            certificate_no: t?.diploma_number,
        })),

        researches: (resolvedData?.researches || []).map(r => ({
            year:             String(r?.year),
            competition_name: r?.competition_name,
            topic:            r?.topic,
            organizer:        r?.organizer,
            result:           r?.result,
        })),

        sports: (resolvedData?.sports || []).map(s => ({
            year:      s?.year,
            name:      s?.name,
            type:      s?.type,
            organizer: s?.organizer,
            result:    s?.result,
        })),

        awards: (resolvedData?.awards || []).map(a => ({
            year:        a?.year,
            name:        a?.name,
            organizer:   a?.organizer,
            description: a?.description,
        })),

        social_activities: (resolvedData?.social_activities || []).map(s => ({
            year:               s?.year,
            name:               s?.name,
            participation_type: s?.participation_type,
            organizer:          s?.organizer,
            description:        s?.description,
        })),

        skills: (resolvedData?.skills || []).map(s => ({
            skill_name: s?.skill_name,
            level:      s?.level,
            note:       s?.note,
        })),

        disciplines: (resolvedData?.disciplines || []).map(d => ({
            date:        d?.date,
            type:        d?.type,
            reason:      d?.reason,
            decision_no: d?.decision_no,
            note:        d?.note,
        })),

        punishments: punishments.map(p => ({
            has_punishment:  p?.has_punishment,
            punishment_note: p?.punishment_note,
            has_crime:       p?.has_crime,
            crime_note:      p?.crime_note,
            // violation:       p?.violation,
        })),
    }

    return (
        <div className="student-def-wrap">
            {isLoading && Loader}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                <button
                    onClick={() => setSigModalOpen(true)}
                    style={{
                        padding: '6px 16px',
                        backgroundColor: '#4A90E2',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px'
                    }}
                >
                    Гарын үсэг сонгох
                </button>
            </div>

            <div className='student-dev-wrap'>
                <div style={{ position: 'relative', minHeight: '215px' }}>
                    <div className="project-status-top-right" style={{ position: 'absolute', top: -20, right: 0, padding: '10px' }}>
                        {/* <p>Төсөл</p> */}
                    </div>
                    <div
                        className="def-photo-box"
                        style={{
                            position: 'absolute',
                            top: '120px',
                            right: 0,
                            width: '150px',
                            height: '190px',
                            border: '1px solid #000',
                            backgroundColor: '#fff',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            zIndex: 10,
                        }}
                    >
                        {photoUrl || profile?.photo
                            ? <img
                                src={photoUrl || profile?.photo}
                                alt="Зураг"
                                style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#fff' }}
                              />
                            : <>
                                <span style={{ fontSize: '11pt', color: '#555' }}>3*4 хэмжээ</span>
                                <span style={{ fontSize: '11pt', color: '#555', marginTop: '8px' }}>Цээж зураг</span>
                              </>
                        }
                    </div>
                    <input
                        id="photo-input" type="file" accept="image/*" style={{ display: 'none' }}
                        onChange={(e) => {
                            const file = e.target.files[0]
                            if (file) setPhotoUrl(URL.createObjectURL(file))
                        }}
                    />

                    <div className="def-header" style={{ paddingRight: '170px', paddingLeft: '170px' }}>
                        <p className="def-university-main">ДОТООД ХЭРГИЙН ИХ СУРГУУЛЬ</p>
                        <p className="def-university-sub">{student?.school_name}</p>
                    </div>

                    <div style={{ paddingRight: '170px', marginTop: '8px' }} className="def-program-block">
                        <p>Индекс: <span>{val(apiProfile?.profession?.index)}</span></p>
                        <p>Хөтөлбөрийн нэр: <span>{val(apiProfile?.profession?.name)}</span></p>
                        <p>Мэргэжлийн нэр: <span>{val(apiProfile?.profession?.major)}</span></p>
                        <p>Суралцсан жил: <span>{student?.group?.profession?.duration || resolvedData?.gpa_by_year?.length || ''} жил</span></p>
                        <p>Цуглуулах кредит: <span>{val(apiProfile?.profession?.credit)}</span></p>
                    </div>
                </div>

                <h3 className="def-section-title">Нэг. Төгсөгчийн талаарх мэдээлэл</h3>
                <p className="def-register">Регистрийн дугаар: <strong>{val(profile?.register_no)}</strong></p>

                <ol className="def-info-list">
                    <li>Ургийн овог: <span>{val(profile?.family_name)}</span></li>
                    <li>Эцэг /эх/-ийн нэр: <span>{val(profile?.father_name)}</span></li>
                    <li>Өөрийн нэр: <span>{val(student?.first_name)}</span></li>
                    <li>Хүйс: <span>{profile?.gender === 'M' ? 'Эр' : profile?.gender === 'F' ? 'Эм' : '---'}</span></li>
                    <li>Төрсөн он, сар, өдөр: <span>{val(profile?.birthdate)}</span></li>
                    <li>Үндэс, угсаа: <span>{val(profile?.ethnicity)}</span></li>
                    <li>Төрсөн, аймаг, хот, дүүрэг: <span>{val(profile?.birth_place)}</span></li>
                    <li>Байнгын оршин суугаа хаяг: <span>{val(profile?.permanent_address)}</span></li>
                    <li>Түр оршин суугаа хаяг: <span>{val(profile?.current_address)}</span></li>
                    <li>Суурин болон гар утасны дугаар: <span>{val(profile?.phone)}</span></li>
                    <li>Цахим шуудангийн хаяг: <span>{val(profile?.email)}</span></li>
                    <li>Зайлшгүй шаардлага гарсан үед харилцах хүн: <span>{val(profile?.emergency_contact)}</span></li>
                </ol>

                <h4 className="def-subsection">1.13 Гэр бүлийн байдал:</h4>
                <div style={{ maxWidth: "100%" }}>
                    <table className="def-table">
                        <thead>
                            <tr>
                                <th style={{ width: "5%", textWrap: "auto" }}>д/д</th>
                                <th style={{ width: "10%", textWrap: "auto" }}>Таны юу болох</th>
                                <th style={{ width: "30%", textWrap: "auto" }}>Гэр бүлийн гишүүний эцэг /эх/-ийн болон өөрийн нэр</th>
                                <th style={{ width: "15%", textWrap: "auto" }}>Регистрийн дугаар</th>
                                <th style={{ width: "20%", textWrap: "auto" }}>Төрсөн аймаг, хот сум, дүүрэг</th>
                                <th style={{ width: "20%", textWrap: "auto" }}>Одоо эрхэлж буй ажил /утасны дугаар/</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(profile?.family_members || []).map((member, i) => (
                                <tr key={i}>
                                    <td>{i + 1}</td>
                                    <td>{val(member?.relation)}</td>
                                    <td>{val(member?.full_name)}</td>
                                    <td>{val(member?.register_no)}</td>
                                    <td>{val(member?.birth_place)}</td>
                                    <td>{val(member?.occupation)}</td>
                                </tr>
                            ))}
                            {(!profile?.family_members || profile.family_members.length === 0) && (
                                <tr><td colSpan={6} style={{ textAlign: 'center' }}>Мэдээлэл байхгүй</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <h3 className="def-section-title">Хоёр. Хувь хүний ур чадвар, өөрийгөө хөгжүүлсэн байдал</h3>
                <h4 className="def-subsection">2.1 Өөрийгөө хөгжүүлэх чиглээр бүх төрлийн дугуйлан, сургалтад хамрагдсан тухай</h4>
                <table className="def-table">
                    <thead>
                        <tr>
                            <th>д/д</th>
                            <th className="def-year-col" style={{ minWidth: "90px", textWrap: "auto" }}>Он</th>
                            <th style={{ minWidth: "200px", textWrap: "auto" }}>Суралцсан сургалт, клуб, дугуйлан</th>
                            <th style={{ minWidth: "90px", textWrap: "auto" }}>Элссэн, төгссөн он, сар</th>
                            <th style={{ minWidth: "60px", textWrap: "auto" }}>Эзэмшсэн зэрэг, цол, түвшин</th>
                            <th style={{ maxWidth: "100px", textWrap: "auto" }}>Гэрчилгээ, дипломын дугаар</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(profile?.trainings || []).map((item, i) => (
                            <tr key={i}>
                                <td>{i + 1}</td><td className="def-year-col">{val(item?.year)}</td><td>{val(item?.name)}</td>
                                <td>{val(item?.period)}</td><td>{val(item?.degree)}</td><td>{val(item?.certificate_no)}</td>
                            </tr>
                        ))}
                        {(!profile?.trainings || profile.trainings.length === 0) && (
                            <tr><td colSpan={6} style={{ textAlign: 'center' }}>Мэдээлэл байхгүй</td></tr>
                        )}
                    </tbody>
                </table>

                <h3 className="def-section-title">Гурав. Эрдэм шинжилгээний илтгэл, мэдлэг сорих уралдаанд оролцсон байдал</h3>
                <table className="def-table">
                    <thead>
                        <tr>
                            <th style={{ width: "5%", textWrap: "auto" }}>д/д</th>
                            <th className="def-year-col" style={{ width: "5%", textWrap: "auto" }}>Он</th>
                            <th style={{ width: "35%", textWrap: "auto" }}>Эрдэм шинжилгээний хурал, уралдаан тэмцээний нэр</th>
                            <th style={{ width: "25%", textWrap: "auto" }}>Илтгэл, өгүүллийн сэдэв</th>
                            <th style={{ width: "20%", textWrap: "auto" }}>Зохион байгуулсан байгууллага</th>
                            <th style={{ width: "10%", textWrap: "auto" }}>Үр дүн, амжилт</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(profile?.researches || []).map((item, i) => (
                            <tr key={i}>
                                <td>{i + 1}</td><td className="def-year-col">{val(item?.year)}</td><td>{val(item?.competition_name)}</td>
                                <td>{val(item?.topic)}</td><td>{val(item?.organizer)}</td><td>{val(item?.result)}</td>
                            </tr>
                        ))}
                        {(!profile?.researches || profile.researches.length === 0) && (
                            <tr><td colSpan={6} style={{ textAlign: 'center' }}>Мэдээлэл байхгүй</td></tr>
                        )}
                    </tbody>
                </table>

                <h3 className="def-section-title">Дөрөв. Спортын уралдаан, тэмцээнд оролцсон байдал</h3>
                <table className="def-table">
                    <thead>
                        <tr>
                            <th style={{ width: "5%", textWrap: "auto" }}>д/д</th>
                            <th className="def-year-col" style={{ width: "5%", textWrap: "auto" }}>Он</th>
                            <th style={{ width: "30%", textWrap: "auto" }}>Тэмцээний нэр</th>
                            <th style={{ width: "20%", textWrap: "auto" }}>Спортын төрөл</th>
                            <th style={{ width: "20%", textWrap: "auto" }}>Зохион байгуулсан байгууллага</th>
                            <th style={{ width: "20%", textWrap: "auto" }}>Амжилт, байр</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(profile?.sports || []).length > 0
                            ? profile.sports.map((item, i) => (
                                <tr key={i}>
                                    <td>{i + 1}</td><td className="def-year-col">{val(item?.year)}</td><td>{val(item?.name)}</td>
                                    <td>{val(item?.type)}</td><td>{val(item?.organizer)}</td><td>{val(item?.result)}</td>
                                </tr>
                            ))
                            : <tr><td colSpan={6} style={{ textAlign: 'center' }}>Мэдээлэл байхгүй</td></tr>
                        }
                    </tbody>
                </table>

                <h3 className="def-section-title">Тав. Тэмдэг, медаль, шагнал, урамшуулал</h3>
                <table className="def-table">
                    <thead>
                        <tr>
                            <th>д/д</th><th className="def-year-col">Он</th><th>Шагнал, урамшууллын нэр</th>
                            <th style={{ minWidth: "150px", textWrap: "auto" }}>Олгосон байгууллага</th>
                            <th style={{ minWidth: "212px", textWrap: "auto" }}>Үндэслэл, тайлбар</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(profile?.awards || []).length > 0
                            ? profile.awards.map((item, i) => (
                                <tr key={i}>
                                    <td>{i + 1}</td><td className="def-year-col">{val(item?.year)}</td><td>{val(item?.name)}</td>
                                    <td>{val(item?.organizer)}</td><td>{val(item?.description)}</td>
                                </tr>
                            ))
                            : <tr><td colSpan={5} style={{ textAlign: 'center' }}>Мэдээлэл байхгүй</td></tr>
                        }
                    </tbody>
                </table>

                <h3 className="def-section-title">Зургаа. Нийгэм олон нийтийн үйл ажиллагаанд оролцсон байдал</h3>
                <h4 className="def-subsection">6.1. Ургац хураалт, сайн үйлсийн аян, байгаль орчныг сэргээх үйл ажиллагаа, цусны донор болох гэх мэт олон нийтийн ажиллагаа</h4>
                <table className="def-table">
                    <thead>
                        <tr>
                            <th style={{ width: "5%", textWrap: "auto" }}>д/д</th>
                            <th className="def-year-col" style={{ width: "5%", textWrap: "auto" }}>Он</th>
                            <th style={{ width: "15%", textWrap: "auto" }}>Үйл ажиллагааны нэр</th>
                            <th style={{ width: "20%", textWrap: "auto" }}>Оролцсон хэлбэр</th>
                            <th style={{ width: "20%", textWrap: "auto" }}>Зохион байгуулсан байгууллага</th>
                            <th style={{ width: "35%", textWrap: "auto" }}>Тайлбар</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(profile?.social_activities || []).length > 0
                            ? profile.social_activities.map((item, i) => (
                                <tr key={i}>
                                    <td>{i + 1}</td><td className="def-year-col">{val(item?.year)}</td><td>{val(item?.name)}</td>
                                    <td>{val(item?.participation_type)}</td><td>{val(item?.organizer)}</td><td>{val(item?.description)}</td>
                                </tr>
                            ))
                            : <tr><td colSpan={6} style={{ textAlign: 'center' }}>Мэдээлэл байхгүй</td></tr>
                        }
                    </tbody>
                </table>

                <h3 className="def-section-title">Долоо. Суралцах хугацааны дүнгийн график</h3>
                <div className="def-gpa-chart-container" style={{ width: '100%', height: '320px', marginTop: '20px', marginBottom: '20px', paddingBottom: '10px' }}>
                    <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14pt', marginBottom: '8px' }}>
                        Суралцах хугацааны дүнгийн график
                    </p>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={(resolvedData?.gpa_by_year || []).filter(d => d.first > 0 || d.second > 0 || d.avg > 0)}
                            margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="first" name="1 дүгээр улирал" fill="#4A90E2" barSize={30} radius={[3,3,0,0]}>
                                <LabelList dataKey="first" position="top" style={{ fontSize: '9pt', fill: '#333' }}
                                    formatter={(value) => value > 0 ? value : ''} />
                            </Bar>
                            <Bar dataKey="second" name="2 дугаар улирал" fill="#FF8C00" barSize={30} radius={[3,3,0,0]}>
                                <LabelList dataKey="second" position="top" style={{ fontSize: '9pt', fill: '#333' }}
                                    formatter={(value) => value > 0 ? value : ''} />
                            </Bar>
                            <Bar dataKey="avg" name="голч дүн" fill="#999" barSize={30} radius={[3,3,0,0]}>
                                <LabelList dataKey="avg" position="top" style={{ fontSize: '9pt', fill: '#333' }}
                                    formatter={(value) => value > 0 ? value : ''} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <p style={{ textAlign: 'center', fontSize: '10pt', color: '#666', marginTop: '-17px' }}>
                        / Улирлын голч дүнгийн үзүүлэлт /
                    </p>
                </div>

                <h3 className="def-section-title">Найм. Хувь хүний ур чадвар, чадамж</h3>
                <table className="def-table">
                    <thead>
                        <tr>
                            <th rowSpan={2}>д/д</th>
                            <th rowSpan={2}>Ур чадвар, зан байдал</th>
                            <th colSpan={3}>Үнэлгээ, үзүүлэлт</th>
                            <th style={{ minWidth: "200px", textWrap: "auto" }} rowSpan={2}>Тайлбар</th>
                        </tr>
                        <tr>
                            <th>Сайн</th>
                            <th>Дунд</th>
                            <th>Муу</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { name: 'Харилцаа, багаар ажиллах чадвар' },
                            { name: 'Шийдвэр гаргах чадвар' },
                            { name: 'Сахилга, хариуцлага, үүрэг хүлээх чадвар' },
                            { name: 'Манлайлал, нийгмийн идэвхи' },
                            { name: 'Шинийг санаачлага гаргах чадвар' },
                            { name: 'Ачаалал даах чадвар' },
                        ].map((skill, i) => {
                            const studentSkill = profile?.skills?.find(s => s.skill_name === skill.name)
                            return (
                                <tr key={i}>
                                    <td>{i + 1}</td>
                                    <td>{skill.name}</td>
                                    <td style={{ textAlign: 'center' }}>{studentSkill?.level === 'good' ? '✓' : ''}</td>
                                    <td style={{ textAlign: 'center' }}>{studentSkill?.level === 'avg'  ? '✓' : ''}</td>
                                    <td style={{ textAlign: 'center' }}>{studentSkill?.level === 'bad'  ? '✓' : ''}</td>
                                    <td>{studentSkill?.note || ''}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>

                <h3 className="def-section-title">Ес. Сахилга, ёс зүйн байдлын мэдээлэл</h3>
                <table className="def-table">
                    <thead>
                        <tr>
                            <th>д/д</th><th className="def-date-col">Он, сар, өдөр</th>
                            <th style={{ textWrap: "auto" }}>Сахилгын арга хэмжээ, шийтгэлийн төрөл</th>
                            <th>Шалтгаан</th>
                            <th style={{ maxWidth: "110px", textWrap: "auto" }}>Шийдвэрийн дугаар</th>
                            <th style={{ minWidth: "130px", textWrap: "auto" }}>Тайлбар</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(profile?.disciplines || []).length > 0
                            ? profile.disciplines.map((item, i) => (
                                <tr key={i}>
                                    <td>{i + 1}</td><td className="def-date-col">{val(item?.date)}</td><td>{val(item?.type)}</td>
                                    <td>{val(item?.reason)}</td><td>{val(item?.decision_no)}</td><td>{val(item?.note)}</td>
                                </tr>
                            ))
                            : <>
                                <tr><td>1</td><td></td><td></td><td></td><td></td><td></td></tr>
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'left', padding: '4px 8px' }}>
                                        Суралцах хугацаанд сахилга, ёс зүйн зөрчил гаргаж сахилгын шийтгэл хүлээж байгаагүй
                                    </td>
                                </tr>
                              </>
                        }
                    </tbody>
                </table>

                <h3 className="def-section-title">Арав. Ял шийтгэлийн мэдээлэл</h3>

                    {/* 10.1 Ял шийтгэл */}
                        {(profile?.punishments || []).length > 0 && profile.punishments.some(p => p?.has_punishment)
                            ? <>
                                <p>10.1 Ял шийтгэлтэй эсэх: {profile.punishments
                                    .filter(p => p?.has_punishment)
                                    .map(item => item?.punishment_note || '—')
                                    .join(', ')}
                                </p>
                            </>
                            : <p>10.1 Ял шийтгэлтэй эсэх: Үгүй</p>
                        }

                    {/* 10.2 Гэмт хэрэг — зөвхөн цагдаагийн сургуульд */}
                    {isCopsSchool && (
                        (profile?.punishments || []).length > 0 && profile.punishments.some(p => p?.has_crime)
                            ? <>
                                <h4 className="def-subsection">10.2 Гэмт хэрэг зөрчилд холбогдож байсан эсэх</h4>
                                <table className="def-table" style={{ tableLayout: 'fixed', width: '100%' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '30px' }}>д/д</th>
                                            <th style={{ textAlign: 'center', textWrap: 'auto' }}>Тайлбар</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {profile.punishments
                                            .filter(p => p?.has_crime)
                                            .map((item, i) => (
                                                <tr key={i}>
                                                    <td>{i + 1}</td>
                                                    <td style={{ textAlign: 'left' }}>{item?.crime_note || '—'}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </>
                            : <p>10.2 Гэмт хэрэг, зөрчилд бүртэгдэж байсан эсэх: Үгүй</p>
                    )}

                <h3 className="def-section-title">Арван нэг. Тодорхойлолт</h3>
                <div className="def-text-block">
                    {(resolvedData?.definition_texts || []).slice(-1).map((d, i) => (
                        <div key={i} dangerouslySetInnerHTML={{ __html: d.text }} />
                    ))}
                </div>

                <div className="def-signature-block">
                    <p className="def-signature-title">ТОДОРХОЙЛОЛТ ГАРГАСАН:</p>

                    {signatures.map((sig, i) => (
                        <div key={i} className="def-signature-item">
                            <p className="sig-position">
                                {sig?.position_name}
                                {sig?.degree && <><br />, {sig.degree}</>}
                            </p>
                            <span className="sig-name">
                                {sig?.last_name?.[0] ? `${sig.last_name[0]}.` : ''}{sig?.first_name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {sigModalOpen && (
                <SignatureModal
                    isOpen={sigModalOpen}
                    handleModal={() => setSigModalOpen(false)}
                    data={resolvedData}
                    isMon={true}
                    onSaved={(sigs) => {
                        setSignatures(sigs)
                        setSigModalOpen(false)
                    }}
                />
            )}
        </div>
    )
}
