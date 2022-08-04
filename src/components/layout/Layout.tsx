import {AppBar, Breadcrumbs, Button, Container, IconButton, Link, Paper, Popover, Toolbar, Typography} from "@mui/material";
import {Link as RouterLink, NavLink, Outlet, useLocation} from "react-router-dom"
import {Box} from "@mui/system";
import HomeIcon from '@mui/icons-material/Home';
import {ReactElement, useState} from "react";
import logo from "../../assets/logo.png"
import { ExitToApp } from "@mui/icons-material";
import * as authApi from "../../api/auth"
import { useAppDispatch } from "../../store";
import { setLoggedOut } from "../../store/auth";

type Link = {
    label: string
    href: string
}

type Props = {
    links: Link[]
}

type BuiltPath = {
    url: string,
    children: ReactElement[]
}

const urlMapping: Record<string, string> = {
    '': 'Inicio',
    'casas': 'Casas',
    'personas': 'Personas',
    'reportes': 'Reportes',
    'buscar': 'Buscar',
    'crear': 'Crear',
    'horarios': 'Horarios',
    'actualizar': 'Actualizar',
    'preview': 'Template'
}

export default function Layout({links}: Props) {
    const location = useLocation(),
        segments = [...new Set(location.pathname.split('/'))],
        [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null),
        dispatch = useAppDispatch(),
        logout = () => {
            authApi.logout().then(() => dispatch(setLoggedOut()))
        }

    return (
        <>
            <AppBar position="static" elevation={6} sx={{zIndex: 99}}>
                <Container maxWidth="xl" sx={{p: 0}}>
                    <Toolbar disableGutters sx={{gap: 2}}>
                        <Link component={RouterLink} to="/" underline="none" color="inherit"
                              style={{display: 'flex', alignItems: 'center', flexShrink: 1, flexGrow: 0 }}>
                            <img src={logo} style={{ width: '100px' }} />
                        </Link>
                        <Box sx={{flexGrow: 1, display: 'flex', gap: 2}}>{
                            links.map(({label, href}) => (
                                <Button key={href} component={RouterLink} to={href}
                                        sx={{color: 'white', display: 'block'}}>
                                    {label}
                                </Button>
                            ))}
                        </Box>
                        <Box sx={{flexGrow: 0, flexShrink: 1, display: 'flex', gap: 2}}>
                            <Popover
                                id="logout-popover"
                                sx={{
                                    pointerEvents: 'none'
                                }}
                                open={!!anchorEl}
                                anchorEl={anchorEl}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left'
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'center'
                                }}
                                onClose={() =>setAnchorEl(null)}
                                disableRestoreFocus
                            >
                                <Typography variant="body1" sx={{ p: 1 }}>Cerrar Sesión</Typography>
                            </Popover>
                            <IconButton onClick={logout} onMouseEnter={e => setAnchorEl(e.currentTarget)} onMouseLeave={() => setAnchorEl(null)}>
                                <ExitToApp sx={{ color: 'white' }}/>
                            </IconButton>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
            <main style={{flex: '1 1 auto', backgroundColor: '#eee'}}>
                <Container maxWidth="xl" sx={{
                    py: 4,
                    gap: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                }}>
                    <nav>
                        <Paper elevation={6} sx={{p: 2}}>
                            <Breadcrumbs aria-label="breadcrumbs">
                                {segments.reduce((path: BuiltPath, segment: string, idx: number) => {
                                    const isActive = idx == segments.length - 1
                                    return {
                                        url: (segment == '') ? '' : path.url + "/" + segment,
                                        children: [
                                            (
                                                <NavLink
                                                    key={path.url}
                                                    to={path.url + "/" + segment}
                                                    style={({
                                                        display: 'flex',
                                                        color: isActive ? '#488aaa' : '#18191f',
                                                        textDecoration: 'none',
                                                        gap: .5,
                                                        alignItems: 'center'
                                                    })}
                                                >
                                                    {segment == '' ?
                                                        <HomeIcon fontSize="small" sx={{m: 'auto'}}/> : <> </>}
                                                    <Typography variant="body1" component="span" sx={{pt: .4, pl: .5}}>{
                                                        Object.entries(urlMapping).find(([regex, val]) => {
                                                            if (regex == '' && segment == '') {
                                                                return true
                                                            } else if (regex == '') {
                                                                return false
                                                            } else {
                                                                return segment.match(new RegExp(regex))
                                                            }
                                                        })![1]
                                                    }</Typography>
                                                </NavLink>
                                            ),
                                            ...path.children
                                        ]
                                    }
                                }, {children: [], url: ''}).children.reverse()
                                }
                            </Breadcrumbs>
                        </Paper>
                    </nav>
                    <Paper elevation={6} sx={{p: 4, flex: '1 1 auto'}}>
                        <Outlet/>
                    </Paper>
                </Container>
            </main>
        </>
    )
}
