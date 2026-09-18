import { Fragment, useEffect, useState } from 'react';
import classnames from 'classnames';
import { Col, Row, Spinner, Card, CardHeader, CardTitle, Badge } from 'reactstrap';
import { useTranslation } from 'react-i18next';
import useApi from '@hooks/useApi';
import BTeacherFileDetail from './WTeacherFileDetail';
import illustration from '@src/assets/images/illustration/faq-illustrations.svg'

const WTeacherFileList = ({ teacher }) => {
	if (!teacher?.id) return 0
	const { t } = useTranslation();
	const [files, setFiles] = useState([]);
	const [selectedFile, setSelectedFile] = useState(null);
	const [loading, setLoading] = useState(false);

	const wapi = useApi(true).w_time;

	const getDatas = async () => {
		setLoading(true);
		try {
		const { success, data } = await wapi.teacher.get(teacher?.id);
		if (success) {
			setFiles(data);
			setSelectedFile(data[0])
		}
		} catch (error) {
		console.error('Error fetching teacher files:', error);
		} finally {
		setLoading(false);
		}
	};

	useEffect(() => {
		getDatas();
	}, [teacher]);

	const stateColor = { 1: 'success', 2: 'danger', 3: 'warning' }
	const stateText = { 1: 'Баталгаажсан', 2: 'Буцаасан', 3: 'Илгээсэн' }
  return (
    <Fragment>
      <div>
        {loading ? (
          <div >
            <Spinner color="primary" />
            <p className="mt-2">{t('Уншиж байна...')}</p>
          </div>
        ) : (
          	<Row className="m-0">
				<Col md={4} className="soft-border mt-1 p-0 mx-50" style={{ overflowY: "auto", maxHeight: "100vh" }}>
					<h5 className="mb-2 header-gradient">{t('Багц цагийн бүртгэл')}</h5>
					<div className="p-1">
					{files.length > 0 ? (
						files.map((file, i) => (
						<div
							key={i}
							className={classnames('file-item p-1 mb-1 rounded soft-hover', {
								'soft-gradient-bg': selectedFile?.id === file.id
							})}
							onClick={() => setSelectedFile(file)}
						>
							<strong><td>{file.category_data ? file.category_data.name : '-'}</td></strong>
							<div className="small">
								<span>{t('Батлагдсан багц цаг')}: {file.approve_score || '-'}</span><br />
								<span>{t('Хорогдол оноо')}: {file.minus_score || '-'}</span><br />
								{t('Тооцуулах жил')}: {file.lesson_year}
							</div>
							<div className='d-flex justify-content-between'>
								<td>{file?.approved_user_name || '-'}</td>
								<Badge color={stateColor[file?.check_senior_state] || 'secondary'}>
									{stateText[file?.check_senior_state] || '-'}
								</Badge>
							</div>
						</div>
						))
					) : (
						<div className='d-flex align-items-center justify-content-center flex-column'>
							<img className='img-fluid mt-2' src={illustration} alt='Image' width={85} />
							<p className="text-muted">{t('Файл олдсонгүй')}</p>
						</div>
					)}
					</div>
				</Col>

				<Col md={8} className="p-1">
					{selectedFile &&
						<BTeacherFileDetail file={selectedFile} />
					}
				</Col>
			</Row>
        )}
      </div>
    </Fragment>
  );
};

export default WTeacherFileList;
