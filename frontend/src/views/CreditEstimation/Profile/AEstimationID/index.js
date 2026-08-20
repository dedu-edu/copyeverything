import useApi from '@hooks/useApi';
import { Fragment, useEffect, useState } from 'react';
import { Spinner } from 'reactstrap';


const ACredit = ({ id, setBrefresh, brefresh,setAScore }) => {
	const [datas, setDatas] = useState(null);
	const [loading, setLoading] = useState(false);
	const Api = useApi(true).a_time;

	const getDatas = async (creditId) => {
		setLoading(true);
		try {
			const { success, data } = await Api.main.getOne(creditId);
			if (success) {
				setDatas(data);
			}
		} catch (error) {
			console.error('Error fetching teacher files:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (id) {
			getDatas(id);
		}
	}, [id, brefresh]);

	if (!id) {
		return <div className="text-muted">No credit selected</div>;
	}

	if (loading) {
		return ;
	}

	return (
		<Fragment>
			{datas && datas.length > 0 ? (
				<div className="mt-50">
					<div className="header-gradient p-1 mb-50 text-white font-weight-bold">
						А цагийн мэдээлэл
					</div>
					{datas.map((data, catIdx) => (
						<div className="table-responsive mb-50" key={catIdx}>
							<h5 className="text-center font-weight-bold mb-50 mt-1">
								{data?.lesson_type} 
								{/* ({data?.type_total_tsag?.total} цаг) */}
							</h5>
							<table className="table table-bordered table-sm table-hover">
								<thead className='thead-light text-center'>
									<tr>
										<th>#</th>
										<th>Хичээлийн нэр, код</th>
										<th>Ангийн нэр</th>
										<th>Зэрэг</th>
										<th>Цаг</th>
										<th>Хэлбэр</th>
										<th>Өрөө</th>
									</tr>
								</thead>
								<tbody>
									{data?.timetable?.length > 0 ? (
										data.timetable.map((item, itemIdx) => (
											<tr key={itemIdx}>
												<td className="text-center">{itemIdx + 1}</td>
												<td>
													{item?.lesson__name}
													<span className="text-muted ml-1">
														{item?.lesson__code ? `/${item.lesson__code}/` : ''}
													</span>
												</td>
												{/* Доорх талбарууд таны өгөгдлийн бүтцэд тохирсон байх шаардлагатай */}
												<td className="text-center">{item?.group_names || '-'}</td>
												<td className="text-center">{item?.degree_names || '-'}</td>
												<td className="text-center">{item?.row_total_tsag || '-'}</td>
												<td className="text-center">{item?.study_type_display || '-'}</td>
												<td className="text-center">{item?.room_names || '-'}</td>
											</tr>
										))
									) : (
										<tr>
											<td colSpan="10" className="text-center text-muted">Хичээл бүртгэгдээгүй байна</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					))}
				</div>
			) : (
				<div className="text-center text-muted p-5 m-1">Мэдээлэл байхгүй</div>
			)}
		</Fragment>
	);
};

export default ACredit;
