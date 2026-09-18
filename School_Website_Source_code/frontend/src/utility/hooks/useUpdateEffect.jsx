import { useEffect, useRef } from 'react'

function useUpdateEffect(effect, deps) {
    const isFirst = useRef(true);

    useEffect(() => {
        // 1. Компонент устгагдах үед (unmount) return функц дуудагдах тул
        // `effect` дуудах үед үр дүнгээ буцааж, дараа нь түүнийг ашиглан цэвэрлэгээ хийх хэрэгтэй.
        if (isFirst.current) {
            isFirst.current = false;
            // Анхны рендер дээр юу ч буцаахгүй.
            return;
        }

        // 2. Анхны рендер биш бол effect-ийг дуудаж, цэвэрлэгээний (cleanup) функцийг нь буцаана.
        return effect();

    }, deps); // Хамаарлууд (deps) өөрчлөгдөхөд ажиллана.
}

export default useUpdateEffect;