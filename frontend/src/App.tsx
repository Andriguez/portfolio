import './App.css'
import {BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./components/Home"
import { CMS } from "./components/admin/Cms.tsx"
import { SiteDataProvider } from './context/SiteDataProvider.tsx';


function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/*" element={<SiteDataProvider><Home /></SiteDataProvider>} />
                <Route path="/admin" element={<CMS />}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App
