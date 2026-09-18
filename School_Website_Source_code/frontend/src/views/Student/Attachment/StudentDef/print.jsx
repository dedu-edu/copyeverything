import React, { useState, useEffect } from 'react'
import StudentDefinition from './index.jsx'
import './style.css'

// 1. localforage санг оруулж ирэх
import localforage from 'localforage'

/**
 * Хэвлэх тусдаа хуудас
 * URL: /student/attachment/student-definition/
 * localforage (IndexedDB)-оос data авч хэвлэнэ
 */
export default function StudentDefinitionPrint() {
    // 2. Data болон Loading state-үүдийг үүсгэх
    const [data, setData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    // 3. Компонент ачааллах үед IndexedDB-ээс өгөгдөл татах
    useEffect(() => {
        async function fetchPrintData() {
            try {
                const localData = await localforage.getItem('studentDefData')
                setData(localData)
            } catch (error) {
                console.error('Хэвлэх өгөгдөл уншихад алдаа гарлаа:', error)
            } finally {
                setIsLoading(false) // Амжилттай ч бай, алдаа гарсан ч бай уншиж дууссан
            }
        }

        fetchPrintData()
    }, [])

    // 4. Data-аас утгуудыг салгаж авах (data нь state болсон тул шууд ашиглаж болно)
    const studentCode = data?.student?.code || data?.student?.student_code || data?.student?.id || 'student-definition'
    const pdfTitle = String(studentCode).replace(/[\\/:*?"<>|]/g, '-')

    useEffect(() => {
        if (data) {
            document.title = pdfTitle
        }
    }, [pdfTitle, data])

    // 5. Уншиж байх үеийн дэлгэц
    if (isLoading) {
        return (
            <div style={{ padding: 40, textAlign: 'center' }}>
                <h4>Түр хүлээнэ үү. Өгөгдөл уншиж байна...</h4>
            </div>
        )
    }

    // 6. Өгөгдөл олдоогүй үеийн дэлгэц
    if (!data) {
        return (
            <div style={{ padding: 40, textAlign: 'center' }}>
                <h4>Өгөгдөл олдсонгүй</h4>
            </div>
        )
    }

    // 7. Амжилттай болсон үеийн дэлгэц
    return (
        <div>
            {/* Хэвлэх товч - print dialog дуустал харагдана */}
            <div className="no-print" style={{
                position: 'fixed', top: 10, right: 20, zIndex: 999,
                display: 'flex', gap: 8
            }}>
                <button
                    onClick={() => {
                        document.title = pdfTitle
                        window.print()
                    }}
                    style={{
                        padding: '8px 20px',
                        background: '#2c3e6b',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 14
                    }}
                >
                    🖨️ Хэвлэх
                </button>
                <button
                    onClick={() => window.close()}
                    style={{
                        padding: '8px 16px',
                        background: '#eee',
                        border: '1px solid #ccc',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 14
                    }}
                >
                    Хаах
                </button>
            </div>

            <StudentDefinition data={data} />
        </div>
    )
}
