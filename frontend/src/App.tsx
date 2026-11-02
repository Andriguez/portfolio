import {BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./components/Home"
import { SiteDataProvider } from './context/SiteDataProvider.tsx';
import { lazy, Suspense } from "react";

const CMS = lazy(() => import("./components/admin/Cms.tsx").then((module) => ({ default: module.CMS })));

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/*" element={<SiteDataProvider><Home /></SiteDataProvider>} />
                <Route path="/admin" element={<Suspense fallback="Loading..."><CMS /></Suspense>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App
