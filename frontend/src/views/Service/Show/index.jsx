import React, { Fragment, useState, useEffect } from "react"
import { useParams, useNavigate } from 'react-router-dom'
import { Clock, ChevronLeft } from "react-feather"
import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'
import { useTranslation } from "react-i18next"
import { Card } from 'reactstrap'

function Show() {
    const { newsid } = useParams()
    const navigation = useNavigate()
    const { t } = useTranslation()
    const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: false })
    const [datas, setDatas] = useState({})
    const serviceNewsApi = useApi().service.news


    useEffect(() => {
        getDatas()
    }, [newsid])

    async function getDatas() {
        if (newsid) {
            const { success, data } = await fetchData(serviceNewsApi.getOne(newsid))
            if (success) {
                setDatas(data)
            }
        }
    }

    console.log("first", datas)

    return (
        <Fragment>
            <div className="container-fluid px-0">
                <Card className="news-card">
                    {isLoading && Loader}
                    {Object.keys(datas).length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📰</div>
                            <h4>Мэдээлэл олдсонгүй</h4>
                            <p>Уучлаарай, энэ мэдээ олдсонгүй эсвэл устгагдсан байна.</p>
                            <button
                                className="btn btn-primary mt-3"
                                onClick={() => navigation('/calendar')}
                            >
                                Буцах
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="news-hero">
                                <div
                                    className="back-button"
                                    onClick={() => navigation('/calendar')}
                                >
                                    <ChevronLeft size={18} />
                                    <span>{t('Буцах')}</span>
                                </div>

                                <h1 className="news-title text-white mt-2">{datas?.title}</h1>

                                <div className="news-meta">
                                    <Clock size={16} />
                                    <span>{datas?.created_at}</span>
                                </div>
                            </div>

                            <div className="news-content pt-2">
                                {datas?.image && (
                                    <div className="news-image-container">
                                        <img
                                            src={datas.image}
                                            alt={datas.title}
                                            className="news-image"
                                            onError={(e) => {
                                                e.target.style.display = 'none'
                                            }}
                                        />
                                    </div>
                                )}

                                <div
                                    className="news-body"
                                    dangerouslySetInnerHTML={{ __html: datas?.body }}
                                />
                            </div>
                        </>
                    )}
                </Card>

                <style>{`
                    .news-hero {
                        background:#144E97;
                        padding: 15px 30px;
                        border-radius: 0.5rem 0.5rem 0 0;
                        color: white;
                        position: relative;
                        overflow: hidden;
                    }
                    
                    .news-hero::before {
                        content: '';
                        position: absolute;
                        top: -50%;
                        right: -10%;
                        width: 300px;
                        height: 300px;
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 50%;
                    }

                    .back-button {
                        display: inline-flex;
                        align-items: center;
                        gap: 0.5rem;
                        padding: 0.5rem 1rem;
                        background: rgba(255, 255, 255, 0.2);
                        border: 1px solid rgba(255, 255, 255, 0.3);
                        border-radius: 2rem;
                        color: white;
                        font-size: 0.9rem;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        backdrop-filter: blur(10px);
                    }

                    .back-button:hover {
                        background: rgba(255, 255, 255, 0.3);
                        transform: translateX(-5px);
                    }

                    .news-title {
                        font-size: 2rem;
                        font-weight: 700;
                        margin: 1.5rem 0 1rem 0;
                        line-height: 1.3;
                        position: relative;
                        z-index: 1;
                    }

                    .news-meta {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        font-size: 0.9rem;
                        opacity: 0.95;
                        position: relative;
                        z-index: 1;
                    }

                    .news-content {
                        background: white;
                    }

                    .news-image-container {
                        width: 100%;
                        max-width: 800px;
                        margin: 0 auto 2rem auto;
                        border-radius: 0.75rem;
                        overflow: hidden;
                        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
                    }

                    .news-image {
                        width: 100%;
                        height: auto;
                        display: block;
                        transition: transform 0.3s ease;
                    }

                    .news-image:hover {
                        transform: scale(1.02);
                    }

                    .news-body {
                        max-width: 800px;
                        margin: 0 auto;
                        font-size: 1.05rem;
                        line-height: 1.8;
                        color: #333;
                    }

                    .news-body p {
                        margin-bottom: 1.2rem;
                    }

                    .news-body img {
                        max-width: 100%;
                        height: auto !important;
                        border-radius: 0.5rem;
                        margin: 1.5rem auto;
                        display: block;
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                    }

                    .news-body h1, .news-body h2, .news-body h3 {
                        margin-top: 2rem;
                        margin-bottom: 1rem;
                        color: #2d3748;
                    }

                    .empty-state {
                        text-align: center;
                        padding: 4rem 2rem;
                        color: #718096;
                    }

                    .empty-state-icon {
                        font-size: 4rem;
                        margin-bottom: 1rem;
                        opacity: 0.5;
                    }

                    .news-card {
                        border: none;
                        border-radius: 0.5rem;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                        overflow: hidden;
                    }

                    @media (max-width: 768px) {
                        .news-title {
                            font-size: 1.5rem;
                        }
                        
                        .news-content {
                            padding: 1.5rem;
                        }
                        
                        .news-hero {
                            padding: 1.5rem;
                        }
                    }
                `}</style>
            </div>
        </Fragment>
    )
}

export default Show