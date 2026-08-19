import './App.css'
import {BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./components/Home"
import { CMS } from "./components/CMS/Cms.tsx"


function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/*" element={<Home />} />
                <Route path="/admin" element={<CMS />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
