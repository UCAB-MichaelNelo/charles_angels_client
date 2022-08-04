import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {State} from "../index";

type ReportsThumbnail = {
    foodReport: string | null,
    clothingReport: string | null,
    sixMonthsReport: string | null,
    familyReport: string | null
}

const initialState: ReportsThumbnail = {
    foodReport: null,
    clothingReport: null,
    sixMonthsReport: null,
    familyReport: null
}

export const slice = createSlice({
    name: 'children',
    initialState,
    reducers: {
        setFoodReportThumbnail: (state: ReportsThumbnail, report: PayloadAction<string>) => {
            state.foodReport = report.payload
        },
        setClothingReportThumbnail: (state: ReportsThumbnail, report: PayloadAction<string>) => {
            state.clothingReport = report.payload
        },
        setSixMonthsReportThumbnail: (state: ReportsThumbnail, report: PayloadAction<string>) => {
            state.sixMonthsReport = report.payload
        },
        setFamilyReportThumbnail: (state: ReportsThumbnail, report: PayloadAction<string>) => {
            state.familyReport = report.payload
        },
    }
})

export const { setFoodReportThumbnail, setClothingReportThumbnail, setSixMonthsReportThumbnail, setFamilyReportThumbnail } = slice.actions

export const selectFoodReportThumbnail = (app: State): string | null => app.reportsReducer.foodReport
export const selectClothingReportThumbnail = (app: State): string | null => app.reportsReducer.clothingReport
export const selectSixMonthsReportThumbnail = (app: State): string | null => app.reportsReducer.sixMonthsReport
export const selectFamilyReportThumbnail = (app: State): string | null => app.reportsReducer.familyReport


export default slice.reducer