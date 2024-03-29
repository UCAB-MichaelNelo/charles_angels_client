import dayjs from 'dayjs'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import customParseFormat from "dayjs/plugin/customParseFormat"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"
import utc from "dayjs/plugin/utc"
import * as pdfjslib from "pdfjs-dist"
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry"

pdfjslib.GlobalWorkerOptions.workerSrc = pdfjsWorker

dayjs.extend(utc)
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)
dayjs.extend(customParseFormat)

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>
)
