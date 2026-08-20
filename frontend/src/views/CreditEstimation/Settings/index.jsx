import React, { useState, Suspense, lazy } from "react";

const tabs = [
  { id: "page1", label: "Багц цагийн ногдол", component: lazy(() => import("./MainSettings")) },
  { id: "page2", label: "Б цагийг тооцох аргачлал", component: lazy(() => import("./BSettings")) },
  { id: "page3", label: "В цагийг тооцох аргачлал", component: lazy(() => import("./WSettings")) },
  { id: "page4", label: "Г цагийг тооцох аргачлал", component: lazy(() => import("./GSettings")) },
  { id: "page5", label: "Багц цагийн итгэлцүүр", component: lazy(() => import("./ItgeltsuurSettings")) },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState("page1");
  const [loadedTabs, setLoadedTabs] = useState([activeTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (!loadedTabs.includes(tabId)) {
      setLoadedTabs((prev) => [...prev, tabId]);
    }
  };

  const renderTabContent = () => {
    const tab = tabs.find((t) => t.id === activeTab);
    if (!tab) return null;
    const Component = tab.component;

    return (
      <Suspense fallback={<div>Loading...</div>}>
        <Component />
      </Suspense>
    );
  };

  return (
    <div>
      <div className="nav nav-tabs mb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-link ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tab-content">{renderTabContent()}</div>
    </div>
  );
};

export default Index;