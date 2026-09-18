import { useState, lazy, Suspense, useEffect } from 'react';
import {
	Nav,
	NavItem,
	NavLink,
	TabContent,
	TabPane,
	Spinner
} from 'reactstrap';
import classnames from 'classnames';

const ATab = lazy(() => import('./A'));
const BTab = lazy(() => import('./B'));
// const ReportTab = lazy(() => import('./A'));

const TABS = [
	{ id: '1', label: 'A цаг', component: ATab },
	{ id: '2', label: 'Б цаг', component: BTab },
	// { id: '3', label: 'A цаг', component: ReportTab }
];

const LOCAL_STORAGE_KEY = 'time_estimation_tab';

const Index = () => {
	const [activeTab, setActiveTab] = useState(
		localStorage.getItem(LOCAL_STORAGE_KEY) || TABS[0].id
	);
	const [loadedTabs, setLoadedTabs] = useState([activeTab]);

	const toggle = tabId => {
		setActiveTab(tabId);
		setLoadedTabs(prev =>
			prev.includes(tabId) ? prev : [...prev, tabId]
		);
		localStorage.setItem(LOCAL_STORAGE_KEY, tabId);
	};

	return (
		<>
			<Nav tabs>
				{TABS.map(tab => (
					<NavItem key={tab.id}>
						<NavLink
							className={classnames({ active: activeTab === tab.id })}
							onClick={() => toggle(tab.id)}
							style={{ cursor: 'pointer' }}
						>
							{tab.label}
						</NavLink>
					</NavItem>
				))}
			</Nav>

			<TabContent activeTab={activeTab} className="mt-2">
				{TABS.map(tab =>
					loadedTabs.includes(tab.id) ? (
						<TabPane key={tab.id} tabId={tab.id}>
							<Suspense
								fallback={
									<div className="text-center my-2">
										<Spinner size="sm" />
									</div>
								}
							>
								<tab.component />
							</Suspense>
						</TabPane>
					) : null
				)}
			</TabContent>
		</>
	);
};

export default Index;
