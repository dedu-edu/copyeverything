import { UncontrolledPopover, PopoverBody } from 'reactstrap';
import { useId } from 'react';

const PopoverCell = ({ value }) => {
    const uniqueId = useId().replace(/:/g, "");

    return (
        <>
            <span
                id={`pop-${uniqueId}`}
                className="heightThreeDots"
                // style={{ fontSize: '0.9rem', maxWidth: '100%', textAlign: 'left', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}}
            >
                {value}
            </span>

            <UncontrolledPopover
                target={`pop-${uniqueId}`}
                trigger="hover"
                placement="top"
                container="body"
                flip={true}
                hideArrow // Сумыг арилгавал илүү цэгцтэй харагддаг
                fade={false}
                innerClassName="shadow-sm p-0"
            >
                <PopoverBody className="p-1 small rounded">
                    <div
                        className="text-wrap "
                        style={{
                            wordBreak: 'break-word',
                            padding: '0px', // Дотор талын зайг эндээс удирдана
                            lineHeight: '1.2'    // Мөр хоорондын зайг шахав
                        }}
                    >
                        {value}
                    </div>
                </PopoverBody>
            </UncontrolledPopover>
        </>
    );
};

export default PopoverCell;
