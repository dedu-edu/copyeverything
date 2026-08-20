import { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react/swiper-react'
import useApi from '@src/utility/hooks/useApi'
import { useRTL } from '@src/utility/hooks/useRTL'
import { stripHtmlTags } from '@utils'
import SwiperCore, {
    Grid,
    Lazy,
    Virtual,
    Autoplay,
    Navigation,
    EffectFade,
    EffectCube,
    EffectCoverflow
} from 'swiper'
import '@styles/react/libs/swiper/swiper.scss'
import useLoader from '@src/utility/hooks/useLoader'

SwiperCore.use([
    Navigation,
    Grid,
    EffectFade,
    EffectCube,
    EffectCoverflow,
    Autoplay,
    Lazy,
    Virtual
])

const News = () => {
    const [isRtl] = useRTL()
    const [newsData, setNewsData] = useState([])

    const { isLoading, Loader, fetchData } = useLoader({ isFullScreen: true })
    const newsApi = useApi()

    async function getDatas() {
        const { success, data } = await fetchData(newsApi.calendarNews.getPublic())
        if (success) {
            const formatted = data?.map(item => ({
                id: item?.id,
                title: item?.title,
                description: item?.body,
                bgImage: item?.image || 'https://via.placeholder.com/1200x600?text=No+Image'
            }))
            setNewsData(formatted)
        }
    }

    useEffect(() => {
        // Үйлдэл хийх функц
        const action = () => {
            // console.log("60 минут тутамд дахин ачаалж байна...");
            getDatas();
        };

        getDatas()
        // 60 минут (60 * 60 * 1000 = 3,600,000 миллисекунд)
        const ONE_HOUR_IN_MS = 3600000;
        const timerId = setInterval(action, ONE_HOUR_IN_MS);

        // Компонент устгагдах эсвэл дахин render хийгдэх үед хуучин таймерыг цэвэрлэх (CLEANUP)
        return () => clearInterval(timerId);
    }, []);

    // Зургийн хэмжээг шалгаад object-fit cover эсвэл contain тохиргоог хийх функц
    const handleImageLoad = (e) => {
        const img = e.target;
        const isPortrait = img.naturalHeight > img.naturalWidth;

        if (isPortrait) {
            img.style.objectFit = 'contain';
        } else {
            img.style.objectFit = 'cover';
        }
    };
    const params = {
        effect: 'fade',
        fadeEffect: { crossFade: true },
        autoplay: { delay: 30000, disableOnInteraction: true },
        pagination: {
            clickable: true,
            dynamicBullets: true,
            dynamicMainBullets: 3
        },
        loop: newsData?.length > 1,
        speed: 800
    }

    if (!newsData.length) {
        return (
            <div
                style={{
                    padding: '2rem',
                    textAlign: 'center',
                    background: '#f5f5f5',
                    borderRadius: '8px'
                }}
            >
                <p>Мэдээ олдсонгүй...</p>
            </div>
        )
    }

    return (
        <>
            {isLoading && Loader}

            <div className="swiper-wrapper-fullscreen">
                <Swiper {...params} dir={isRtl ? 'rtl' : 'ltr'} className="swiper-fullscreen">
                    {newsData.map((news, idx) => {
                        const isDescriptionEmpty = !news.description || stripHtmlTags(news.description).length === 0;

                        return (
                            <SwiperSlide key={idx}>
                                <div className="slide-fullscreen-card">
                                    <img
                                        src={news.bgImage}
                                        alt="background"
                                        className="slide-bg-img"
                                        onLoad={handleImageLoad}
                                    />

                                    <div className="text-gradient-overlay">
                                        <div className="slide-fullscreen-content">
                                            <h2 className="slide-fullscreen-title">{news.title || ""}</h2>

                                            {!isDescriptionEmpty && (
                                                <div className="slide-fullscreen-description">
                                                    <span
                                                        className="scroll-text"
                                                        dangerouslySetInnerHTML={{ __html: news.description }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        )
                    })}
                </Swiper>
            </div>

            <style>{`
                .swiper-wrapper-fullscreen {
                    position: relative;
                    width: 100%;
                    height: 100vh;
                    min-height: 600px;
                    overflow: hidden;
                    background: #000;
                }

                .swiper-fullscreen {
                    width: 100%;
                    height: 100%;
                }

                .swiper-fullscreen .swiper-slide {
                    opacity: 0.3;
                    transition: opacity 0.8s ease;
                }

                .swiper-fullscreen .swiper-slide-active {
                    opacity: 1;
                }

                .slide-fullscreen-card {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    overflow: hidden;
                }

                .slide-bg-img {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: center;
                    z-index: 1;
                    transition: object-fit 0.3s ease;
                }

                .text-gradient-overlay {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    z-index: 10;
                    background: linear-gradient(
                        to top,
                        rgba(0, 0, 0, 0.95) 0%,
                        rgba(0, 0, 0, 0.8) 40%,
                        rgba(0, 0, 0, 0.5) 70%,
                        transparent 100%
                    );
                    padding: 6rem 3rem 2rem;
                    pointer-events: none;
                }

                .slide-fullscreen-content {
                    pointer-events: all;
                    width: 100%;
                    max-width: 1600px;
                    margin: 0 auto;
                    color: white;
                }

                .slide-fullscreen-title {
                    font-size: clamp(2rem, 3vw, 3rem);
                    font-weight: 700;
                    line-height: 1.1;
                    text-transform: uppercase;
                    text-align: left;
                    margin: 0 0 1.5rem 0;
                    color: #ffffff;
                    letter-spacing: 0.02em;
                    text-shadow: 0 4px 20px rgba(0, 0, 0, 0.9);
                }

                .slide-fullscreen-description {
                    position: relative;
                    width: 100%;
                    font-size: clamp(1.2rem, 2vw, 1.8rem);
                    font-weight: 400;
                    overflow: hidden;
                    white-space: nowrap;
                    color: rgba(255, 255, 255, 0.95);
                }

                .scroll-text {
                    display: inline-block;
                    padding-left: 100%;
                    animation: scrollX 150s linear infinite;
                    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
                }

                .scroll-text * {
                    display: inline !important;
                    white-space: nowrap !important;
                    margin: 0 !important;
                    padding: 0 0.5em !important;
                }

                .scroll-text p,
                .scroll-text div,
                .scroll-text br {
                    display: inline !important;
                }

                .scroll-text br::after {
                    content: " ";
                }

                @keyframes scrollX {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-100%); }
                }

                /* Responsive adjustments */
                @media (max-width: 1400px) {
                    .text-gradient-overlay {
                        padding: 5rem 2rem 2rem;
                    }
                }

                @media (max-width: 768px) {
                    .text-gradient-overlay {
                        padding: 4rem 1.5rem 1.5rem;
                    }

                    .slide-fullscreen-title {
                        margin-bottom: 1.5rem;
                        text-align: center;
                    }
                }

                @media (max-width: 480px) {
                    .text-gradient-overlay {
                        padding: 3rem 1rem 1rem;
                    }

                    .slide-fullscreen-title {
                        margin-bottom: 1rem;
                    }
                }
            `}</style>
        </>
    )
}

export default News;