import { Button, Card, CardActions, CardContent, CardMedia, Menu, MenuItem, Typography } from "@mui/material"
import { Box } from "@mui/system"
import { ActionCreatorWithPayload } from "@reduxjs/toolkit"
import React, { useState } from "react"
import { getReportUrl, loadReportThumbnail } from "../../api/reports"
import { State, useAppDispatch, useAppSelector } from "../../store"
import { ReportType } from "../../types/reports"

type Props = {
    reportName: string,
    urlSlug: string,
    reportTypes: ReportType[],
    tryLoadFrom: (arg: State) => string | null,
    flushTo: ActionCreatorWithPayload<string, string>
}

type MenuInfo = {
    anchor: HTMLButtonElement | null,
    render: boolean
}

export function ReportCard({ reportName, tryLoadFrom, flushTo, urlSlug, reportTypes }: Props) {
    const url = useAppSelector(tryLoadFrom),
          dispatch = useAppDispatch(),
          canvasRef = (canvas: HTMLCanvasElement) => {
            if (!canvas) return

            if (!url){
                loadReportThumbnail(getReportUrl(urlSlug, reportName, reportTypes[0]), canvas).then(() => {
                    const imageUrl = canvas.toDataURL("image/png")
                    dispatch(flushTo(imageUrl))
                })
            }
            else {
                const context = canvas.getContext("2d"),
                    img = new Image()

                img.onload = () =>{
                    context?.drawImage(img, 0, 0)
                }

                img.src = url
            }
          },
          [menuInfo, setMenuInfo] = useState<MenuInfo>({ anchor: null, render: false }),
          onReportActionClick = (e: React.MouseEvent<HTMLButtonElement>, render: boolean) => {
            if (reportTypes.length == 1) {
                const type = reportTypes[0]
                if (!render)
                    window.location.href = getReportUrl(urlSlug, `${reportName.toLocaleUpperCase()} (${type.toLocaleUpperCase()}).pdf`, type, render)
                else 
                    window.open(getReportUrl(urlSlug, `${reportName.toLocaleUpperCase()} (${type.toLocaleUpperCase()}).pdf`, type, render), "_blank")
            } else {
                setMenuInfo({ anchor: e.currentTarget, render })
            }
          }

    return (
        <Card variant="outlined" sx={{
            height: '100%',
            display: 'grid',
            cursor: 'pointer',
            '&:hover': {
                boxShadow: '-2px 2px 20px rgba(0 0 0 / 15%), ' +
                    '2px -2px 20px rgba(0 0 0 / 15%), ' +
                    '2px 2px 20px rgba(0 0 0 /15%), ' +
                    '-2px -2px 20px rgba(0 0 0 / 15%)'
            }
        }}>
            <Box sx={{
                        backgroundColor: "#e2e2e2",
                        width: '100%!important',
                        maxWidth: '100%!important',
                        display: 'flex'
                    }}>
                <CardMedia
                    component="canvas"
                    ref={canvasRef}
                    height={200}
                    sx={{
                        mx: 'auto',
                        width: '90%!important'
                    }}
                />
            </Box>
            <CardContent>
                <Typography
                    component="p"
                    sx={{fontWeight: 600, lineHeight: 1.25}}
                    variant="subtitle1"
                    gutterBottom
                >
                    {reportName}
                </Typography>
                <Typography component="p" variant="subtitle2" fontWeight={400}>
                    TIPOS: {reportTypes.map(type => {
                        switch(type) {
                            case 'general': return "General";
                            case 'houses': return "Por Casas";
                            case 'unique': return "Unico"
                        }
                    }).join(' o ')}
                </Typography>
            </CardContent>
            <CardActions sx={{mt: 'auto'}}>
                <Button onClick={e => onReportActionClick(e, false)} variant="outlined">Descargar</Button>
                <Button onClick={e => onReportActionClick(e, true)} color="secondary" variant="outlined">Ver</Button>
                <Menu
                    anchorEl={menuInfo.anchor}
                    open={!!menuInfo.anchor}
                    onClose={() => setMenuInfo({ ...menuInfo, anchor: null })}>
                        {reportTypes.map(type => (
                            <MenuItem key={type}>
                                <a 
                                    href={getReportUrl(urlSlug, `${reportName.toLocaleUpperCase()} (${type.toLocaleUpperCase()}).pdf`, type, menuInfo.render)} 
                                    onClick={() => setMenuInfo({ ...menuInfo, anchor: null })}
                                    target={menuInfo.render ? "_blank" : undefined}
                                    style={{color:'black', textDecoration: 'none'}}>
                                    {type == "unique" ? "Unico" : type == "general" ? "General" : "Por casas"}
                                </a>
                            </MenuItem>
                        ))}
                </Menu>
            </CardActions>
        </Card>
    )
}