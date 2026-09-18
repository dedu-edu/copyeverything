import React, { useEffect, useState } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    Col,
    ListGroup,
    ListGroupItem,
    Modal,
    ModalBody,
    ModalHeader,
    Pagination,
    PaginationItem,
    PaginationLink,
    Input,
    Label,
} from "reactstrap";
import { RiComputerLine, RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";
import { RxDotsVertical, RxCross2 } from "react-icons/rx";
import useApi from "@src/utility/hooks/useApi";
import useLoader from "@src/utility/hooks/useLoader";
import { useTranslation } from "react-i18next";
import ModalByStudent from "./components/ModalByStudent";

const AccessHistory = (props) => {
    const { t } = useTranslation()
    const [accessHistories, setAccessHistories] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [showAll, setShowAll] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const { fetchData, isLoading, Loader } = useLoader({});
    const accessHistoryAPI = useApi().calendar;

    async function getAccess(page = currentPage, limit = itemsPerPage) {
        const queryLimit = limit === "all" ? "Бүгд" : limit;
        const { success, data } = await fetchData(
            accessHistoryAPI.getAccessHistory(page, queryLimit)
        );
        if (success) {
            if (data?.results) {
                setAccessHistories(data.results);
                setTotalCount(data.count);
            } else if (Array.isArray(data)) {
                setAccessHistories(data);
                setTotalCount(data.length);
            }
        }
    }

    useEffect(() => {
        getAccess(currentPage, itemsPerPage);
    }, [currentPage, itemsPerPage]);

    const handleSeeMore = () => {
        setCurrentPage(1);
        setShowAll(true);
    };
    const handleClose = () => {
        setShowAll(false);
        setCurrentPage(1);
    };

    const currentLimit = itemsPerPage === "all" || itemsPerPage === "Бүгд" ? totalCount : Number(itemsPerPage);
    const totalPages = currentLimit > 0 ? Math.ceil(totalCount / currentLimit) : 1;

    const handleItemsPerPageChange = (e) => {
        const value = e.target.value;
        setItemsPerPage(value === "all" ? "all" : Number(value));
        setCurrentPage(1);
    };

    const getPaginationRange = () => {
        const rangeWithDots = [];

        if (totalPages < 8) {
            for (let i = 1; i <= totalPages; i++) {
                rangeWithDots.push({ type: 'page', value: i });
            }
            return rangeWithDots;
        }

        const delta = 1;
        const range = [];
        let l;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push({ type: 'page', value: l + 1 });
                } else if (i - l > 2) {
                    const targetPage = (l === 1) ? (currentPage - delta - 1) : (currentPage + delta + 1);
                    rangeWithDots.push({ type: 'dots', value: targetPage });
                }
            }
            rangeWithDots.push({ type: 'page', value: i });
            l = i;
        }
        return rangeWithDots;
    };

    const Item = (props) => {
        const name = props.event.device_name
        const date = props.event.in_time.slice(0, 10);
        const time = props.event.in_time.slice(11, 19);
        return (
            <ListGroupItem
                className="py-50"
                style={{
                    minHeight: "50px",
                    height: "auto",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                }}
            >
                <div className="flex-shrink-0 me-2"><RiComputerLine size={24} /></div>
                <Col className="flex-grow-1" style={{ overflow: 'hidden' }}>
                    <h6 className="mb-0 text-truncate">{name}</h6>
                    <div className="text-muted small d-flex flex-wrap align-items-center"
                        style={{ lineHeight: "1.1", rowGap: "2px", columnGap: "0.3rem" }}>
                        <span className="text-nowrap">{date} {time}</span>
                        <span className="d-none d-sm-inline text-muted-50">|</span>
                        <span className="text-truncate" style={{ maxWidth: "100%" }}>
                            {props.event.ip}
                        </span>
                    </div>
                </Col>
            </ListGroupItem>
        );
    };

    // #region access history by student
    const [showAllModalByStudent, setShowAllModalByStudent] = useState(false);

    const handleSeeMoreModalByStudent = () => {
        setShowAllModalByStudent((current) => !current)
    };
    // #endregion

    return (
        <Card>
            <CardHeader className="pb-25">
                <CardTitle tag={"h5"}>{t('Xандалтын түүх')}</CardTitle>
            </CardHeader>
            <ListGroup flush>
                {(accessHistories.slice(0, 5)).map((event, index) => (
                    <Item key={event.id || index} event={event} />
                ))}
                {accessHistories.length > 5 && !showAll && (
                    <ListGroupItem
                        action
                        tag="button"
                        onClick={handleSeeMore}
                        style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
                        >
                        <RxDotsVertical size={20} className="mx-25" />
                        <span className="align-middle ms-1">
                            {t('Дэлгэрэнгүй үзэх')}
                        </span>
                    </ListGroupItem>
                )}
                <ListGroupItem
                    action
                    tag="button"
                    onClick={handleSeeMoreModalByStudent}
                    style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
                >
                    <RxDotsVertical size={20} className="mx-25" />
                    <span className="align-middle ms-1">
                        {t('Оюутнаар')}
                    </span>
                </ListGroupItem>
            </ListGroup>
            <Modal
                isOpen={showAll}
                toggle={handleClose}
                scrollable
                centered
                size="sm"
                style={{ width: "100%" }}
            >
                <ModalHeader
                    style={{ display: "flex", justifyContent: "space-between" }}
                    close={<RxCross2 onClick={handleClose} size={30} style={{ cursor: "pointer" }} />}
                >
                    <h4>{t('Хандалтын түүх')}</h4>
                </ModalHeader>
                <Col className="d-flex align-items-center justify-content-start ms-1 gap-50">
                    <Input
                        id="itemsPerPageSelect"
                        type="select"
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        style={{ width: "auto", minWidth: "80px" }}
                        bsSize="sm"
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value={250}>250</option>
                        <option value="all">{t('Бүгд')}</option>
                    </Input>
                    <Label for="itemsPerPageSelect" className="text-muted">{t('Хуудсанд харуулах тоо')}</Label>
                </Col>
                <ModalBody>
                    <ListGroup flush>
                        {accessHistories.map((event, index) => (
                            <Item key={event.id || index} event={event} />
                        ))}
                    </ListGroup>
                </ModalBody>

                {itemsPerPage !== "all" && totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-2">
                        <Pagination size="sm">
                            <PaginationItem disabled={currentPage === 1}>
                                <PaginationLink className="d-flex align-items-center" previous onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>
                                    <RiArrowLeftSLine size={16}/>
                                </PaginationLink>
                            </PaginationItem>
                            {getPaginationRange().map((item, index) => {
                                if (item.type === 'dots') {
                                    return (
                                        <PaginationItem key={`dots-${index}`}>
                                            <PaginationLink
                                                onClick={() => setCurrentPage(item.value)}
                                                className="px-1"
                                            >
                                                ...
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                }
                                return (
                                    <PaginationItem active={currentPage === item.value} key={item.value}>
                                        <PaginationLink onClick={() => setCurrentPage(item.value)}>
                                            {item.value}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            })}
                            <PaginationItem disabled={currentPage === totalPages}>
                                <PaginationLink next onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>
                                    <RiArrowRightSLine size={16}/>
                                </PaginationLink>
                            </PaginationItem>
                        </Pagination>
                    </div>
                )}
            </Modal>
            {
                showAllModalByStudent &&
                <ModalByStudent
                    isOpen={showAllModalByStudent}
                    toggle={handleSeeMoreModalByStudent}
                />
            }
        </Card>
    );
};
export default AccessHistory;
