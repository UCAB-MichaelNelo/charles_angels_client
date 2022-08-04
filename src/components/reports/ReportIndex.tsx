import { Grid } from "@mui/material"
import { useCallback, useMemo } from "react"
import { useAppDispatch, useAppSelector } from "../../store"
import { selectClothingReportThumbnail, selectFamilyReportThumbnail, selectFoodReportThumbnail, selectSixMonthsReportThumbnail, setClothingReportThumbnail, setFamilyReportThumbnail, setFoodReportThumbnail, setSixMonthsReportThumbnail } from "../../store/reports"
import { ReportCard } from "./ReportCard"


export default function ReportIndex() {
    return (
        <Grid container spacing={4}>
            <Grid item xs={2.4}>
                <ReportCard 
                    reportName="Reporte de Alimentos"
                    urlSlug="foodInformation" 
                    reportTypes={["general", "houses"]} 
                    tryLoadFrom={selectFoodReportThumbnail}
                    flushTo={setFoodReportThumbnail}
                    />
            </Grid>
            <Grid item xs={2.4}>
                <ReportCard 
                    reportName="Reporte de Vestimenta" 
                    urlSlug="wearInformation" 
                    reportTypes={["general", "houses"]} 
                    tryLoadFrom={selectClothingReportThumbnail}
                    flushTo={setClothingReportThumbnail}
                    />
            </Grid>
            <Grid item xs={2.4}>
                <ReportCard 
                    reportName="Reporte de Beneficiarios a 6 meses de perder el Beneficio" 
                    urlSlug="childsInSixMonthsRange" 
                    reportTypes={["general", "houses"]} 
                    tryLoadFrom={selectSixMonthsReportThumbnail}
                    flushTo={setSixMonthsReportThumbnail}
                    />
            </Grid>
            <Grid item xs={2.4}>
                <ReportCard 
                    reportName="Reporte de Beneficiarios con sus Familias" 
                    urlSlug="childrenWithFamily"
                    reportTypes={["unique"]} 
                    tryLoadFrom={selectFamilyReportThumbnail}
                    flushTo={setFamilyReportThumbnail}
                    />
            </Grid>
        </Grid>
    )
}