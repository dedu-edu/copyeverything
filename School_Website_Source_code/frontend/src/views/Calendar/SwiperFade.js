import React, { useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react/swiper-react'
import { useRTL } from '@hooks/useRTL'
import { Button } from 'reactstrap'

import SwiperCore, {
    Grid,
    Lazy,
    Virtual,
    Autoplay,
    Navigation,
    Pagination,
    EffectFade,
    EffectCube,
    EffectCoverflow
} from 'swiper'

import { FaArrowRight } from "react-icons/fa6";

import '@styles/react/libs/swiper/swiper.scss'

SwiperCore.use([Navigation, Grid, Pagination, EffectFade, EffectCube, EffectCoverflow, Autoplay, Lazy, Virtual])

const SwiperFade = ({ datas }) => {
    const [isRtl] = useRTL()
    const [imageLoading, setImageLoading] = useState({})

    const params = {
        effect: 'fade',
            fadeEffect: {
            crossFade: true
        },
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
        },
        pagination: {
            clickable: true,
            dynamicBullets: true,
            dynamicMainBullets: 3
        },
        loop: datas?.length > 1,
        speed: 800,
    }

    const handleImageLoad = (idx, src) => {
        console.log(`✓ Image ${idx} LOADED:`, src)
        setImageLoading(prev => ({ ...prev, [idx]: false }))
    }

    const handleImageError = (idx, src, event) => {
        console.error(`✗ Image ${idx} FAILED:`, src)
        console.error("Error event:", event)
        setImageLoading(prev => ({ ...prev, [idx]: false }))
    }

    if (!datas || datas?.length === 0) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', background: '#f5f5f5', borderRadius: '8px' }}>
                <p>No data available. Check console for debug info.</p>
            </div>
        )
    }

    return (
        <>
            <div className="swiper-wrapper-enhanced">
                <Swiper {...params} dir={isRtl ? 'rtl' : 'ltr'} className="swiper-enhanced">
                    {datas.map((data, idx) => (
                        <SwiperSlide key={idx}>
                            <div className="slide-content-card">
                                {data?.image ? (
                                    <div className="image-container">
                                        {imageLoading[idx] !== false && (
                                            <div className="image-skeleton">
                                                <p style={{ margin: 0, color: '#666' }}>Loading image {idx}...</p>
                                            </div>
                                        )}
                                        <img
                                            src={data.image}
                                            alt={data?.title || 'Slide image'}
                                            className="slide-image"
                                            onLoad={(e) => handleImageLoad(idx, data.image)}
                                            onError={(e) => handleImageError(idx, data.image, e)}
                                            style={{
                                                display: imageLoading[idx] === false ? 'block' : 'none'
                                            }}
                                            crossOrigin="anonymous"
                                        />
                                    </div>
                                ) : (
                                    <div className="image-container" style={{ background: '#ffebee' }}>
                                        <div className="no-image-placeholder" style={{ color: '#c62828' }}>
                                            Зургийн холбоос олдсонгүй.
                                        </div>
                                    </div>
                                )}

                                <div className="slide-text-content">
                                    <h3 className="slide-title pb-1">{data?.title || 'Untitled'}</h3>
                                    <Button
                                        color="primary"
                                        className="detail-button"
                                        href={`../service/show/${data?.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Дэлгэрэнгүй
                                        <FaArrowRight size={18} className="button-icon" />
                                    </Button>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
            <style>{`
                .debug-info {
                    margin-bottom: 1rem;
                    padding: 0.5rem;
                    background: #fff3cd;
                    border-radius: 4px;
                    border: 1px solid #ffc107;
                }

                .swiper-wrapper-enhanced {
                    position: relative;
                    padding: 1rem 1rem;
                    padding-bottom:10px;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                    border-radius: 16px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
                }

                .swiper-enhanced {
                    padding: 2rem 3rem 3rem;
                    border-radius: 12px;
                    background: white;
                }

                .swiper-enhanced .swiper-slide {
                    opacity: 0.4;
                    transition: opacity 0.3s ease;
                }

                .swiper-enhanced .swiper-slide-active {
                    opacity: 1;
                }

                .slide-content-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    padding: 2rem;
                    background: white;
                    border-radius: 12px;
                    transition: transform 0.3s ease;
                }

                .slide-content-card:hover {
                    transform: translateY(-5px);
                }

                .image-container {
                    position: relative;
                    width: 100%;
                    max-width: 600px;
                    height: auto;
                    margin-bottom: 1rem;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 8px 24px rgba(20, 78, 151, 0.15);
                    background: #f5f5f5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .image-skeleton {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .no-image-placeholder {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                    font-size: 1rem;
                    font-weight: 600;
                }

                @keyframes loading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }

                .slide-image {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    transition: transform 0.5s ease;
                }

                .slide-image:hover {
                    transform: scale(1.05);
                }

                .slide-text-content {
                    width: 100%;
                    max-width: 600px;
                }

                .slide-title {
                    font-size: 16px;
                    font-weight: 700;
                    color: #2c3e50;
                    line-height: 1.4;
                    margin-bottom: 1.5rem;
                    background: linear-gradient(135deg, #144E97 0%, #1e63b8 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .detail-button {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 1rem 2rem;
                    font-weight: 600;
                    font-size: 1rem;
                    background-color: #144E97;
                    border: 2px solid #144E97;
                    border-radius: 50px;
                    color: white;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(20, 78, 151, 0.3);
                }

                .button-icon {
                    transition: transform 0.3s ease;
                }

                .detail-button:hover {
                    background-color: #0f3d75;
                    border-color: #0f3d75;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(20, 78, 151, 0.4);
                }

                .detail-button:hover .button-icon {
                    transform: translateX(4px);
                }

                .detail-button:active {
                    transform: translateY(0);
                }

                .swiper-enhanced .swiper-pagination-bullet {
                    width: 12px;
                    height: 12px;
                    background: #d1d5db;
                    opacity: 1;
                    transition: all 0.3s ease;
                }

                .swiper-enhanced .swiper-pagination-bullet-active {
                    background: #144E97;
                    width: 32px;
                    border-radius: 6px;
                }

                @media (max-width: 768px) {
                    .swiper-wrapper-enhanced {
                        padding: 1rem 0.5rem;
                    }

                    .swiper-enhanced {
                        padding: 1rem 1.5rem 2rem;
                    }

                    .slide-content-card {
                        padding: 1rem;
                    }

                    .image-container {
                        height: auto;
                    }

                    .slide-title {
                        font-size: 1.25rem;
                        margin-bottom: 1rem;
                    }

                    .detail-button {
                        padding: 1rem 1.5rem;
                        font-size: 0.9rem;
                        margin-bottom:20px;
                    }
                }
            `}</style>
        </>
    )
}

export default SwiperFade;