import useApi from '@hooks/useApi';
import illustration from '@src/assets/images/illustration/faq-illustrations.svg';
import classnames from 'classnames';
import { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Col, Row, Spinner } from 'reactstrap';
import BTeacherFileDetail from './BTeacherFileDetail';

const BTeacherFileList = ({ teacher,  setBrefresh, brefresh }) => {
	if (!teacher?.id) return 0
	const { t } = useTranslation();
	const [files, setFiles] = useState([]);
	const [selectedFile, setSelectedFile] = useState(null);
	const [loading, setLoading] = useState(false);

	const BApi = useApi(true).b_time;

	const getDatas = async () => {
		setLoading(true);
		try {
			const { success, data } = await BApi.teacher.get(teacher?.id);
			if (success) {
				setFiles(data);
				setSelectedFile(data[0])
			}
		} catch (error) {
			onsole.error('Error fetching teacher files:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getDatas();
	}, [teacher, brefresh]);

	const stateColor = { 1: 'success', 2: 'danger', 3: 'warning' }
	const stateText = { 1: 'Баталгаажсан', 2: 'Буцаасан', 3: 'Илгээсэн' }
	return (
		<Fragment>
		<div>
			{loading ? (
			<div className='text-center'>
				<Spinner color="primary" />
				<p className="mt-2">{t('Уншиж байна...')}</p>
			</div>
			) : (
				<Row className="m-0">
					<Col md={2} className=" mt-50 p-0 mx-25" style={{ overflowY: "auto", maxHeight: "100vh" }}>
						<h5 className="mb-2 header-gradient ">{t('Багц цагийн бүртгэл')}</h5>
						<div className="p-1">
						{files.length > 0 ? (
							files.map((file, i) => (
							<div
								key={i}
								className={classnames('file-item p-1 mb-50 rounded soft-hover', {
									'soft-gradient-bg': selectedFile?.id === file.id
								})}
								onClick={() => setSelectedFile(file)}
							>
								<strong>{file.category_data ? i+1 + '.' + ' ' + file.category_data.name  : '0'}</strong>
							</div>
							))
						) : (
							<div className='d-flex align-items-center justify-content-center flex-column'>
								<img className='img-fluid mt-2' src={illustration} alt='Image' width={85} />
								<p className="text-muted">{t('Файлийн мэдээлэл байхгүй')}</p>
							</div>
						)}
						</div>
					</Col>

					<Col md={9} className="p-50">
						{selectedFile &&
							<BTeacherFileDetail file={selectedFile} setBrefresh={setBrefresh} brefresh={brefresh}/>
						}
					</Col>
				</Row>
			)}
		</div>
		</Fragment>
	);
};

export default BTeacherFileList;
