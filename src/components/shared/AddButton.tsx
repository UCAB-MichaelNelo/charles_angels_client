import { Button, Popover, Typography } from "@mui/material"
import {Link as RouterLink} from "react-router-dom";
import {AddOutlined} from "@mui/icons-material";
import React, { useState } from "react";

interface Props {
    popoverText: string,
    route: string
}

export default function AddButton({ popoverText, route }: Props) {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

    return (
        <>
            <Popover
                id="logout-popover"
                sx={{
                    pointerEvents: 'none'
                }}
                open={!!anchorEl}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center'
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                }}
                onClose={() =>setAnchorEl(null)}
                disableRestoreFocus
            >
                <Typography variant="body1" sx={{ p: 1 }}>{popoverText}</Typography>
            </Popover>
            <Button variant="contained" component={RouterLink} to={route} onMouseEnter={(e: { currentTarget: React.SetStateAction<HTMLElement | null>; }) => setAnchorEl(e.currentTarget)} onMouseLeave={() => setAnchorEl(null)}>
                <AddOutlined fontSize="large"/>
            </Button>
        </>
    )
}