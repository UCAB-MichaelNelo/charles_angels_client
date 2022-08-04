import { ReportType } from "../types/reports";
import * as pdfjslib from "pdfjs-dist"

export function getReportUrl(slug: string, name: string, type: ReportType, render: boolean = true) {
    return `${import.meta.env.VITE_API_BASE_PATH}/reports/${slug}/${name}?render=${render}${type == "unique" ? "" : `&scope=${type}` }`
}

export async function loadReportThumbnail(uri: string, canvas: HTMLCanvasElement) {
    const pdf = await pdfjslib.getDocument(uri).promise,
          firstPage = await pdf.getPage(1),
          viewport = firstPage.getViewport({ scale: 0.5 }),
          outputScale = window.devicePixelRatio ?? 1,
          context = canvas.getContext("2d")!,
          transform = outputScale !== 1 
            ? [outputScale, 0, 0, outputScale, 0, 0] 
            : undefined;

    await firstPage.render({
        canvasContext: context,
        transform,
        viewport
    }).promise
}