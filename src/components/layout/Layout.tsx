import { AppBar, Breadcrumbs, Button, Container, Divider, Link, Paper, Toolbar, Typography } from "@mui/material";
import { Link as RouterLink, NavLink, useLocation } from "react-router-dom"
import { Box } from "@mui/system";
import HomeIcon from '@mui/icons-material/Home';
import { Outlet } from "react-router-dom";
import { ReactElement } from "react";
import logo from "../../assets/logo.png"

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
  'horarios': 'Horarios'
}

export default function Layout({ links }: Props) {
  const location = useLocation(),
    segments = [...new Set(location.pathname.split('/'))]

  return (
    <>
      <AppBar position="static" elevation={6} sx={{ zIndex: 99 }}>
        <Container maxWidth="xl" sx={{ p: 0 }}>
          <Toolbar disableGutters sx={{ gap: 2 }}>
            <Link component={RouterLink} to="/" underline="none" color="inherit" style={{ display: 'flex', alignItems: 'center' }}>
              <img src={logo} style={{ color: 'white', width: 75 }} />
              <Typography variant="h5" component="div" sx={{ display: 'flex', fontWeight: 600, letterSpacing: 0.1, cursor: 'pointer' }}>
                ANGLES
              </Typography>
            </Link>
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>{
              links.map(({ label, href }) => (
                <Button key={href} component={RouterLink} to={href} sx={{ color: 'white', display: 'block' }}>
                  {label}
                </Button>
              ))}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <main style={{ flex: '1 1 auto', backgroundColor: '#eee' }}>
        <Container maxWidth="xl" sx={{ 
          py: 4, 
          gap: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%'}}>
          <nav>
            <Paper elevation={6} sx={{ p: 2 }}>
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
                            gap: .5 ,
                            alignItems: 'center'
                          })}
                        >
                          {segment == '' ? <HomeIcon fontSize="small" sx={{ m: 'auto' }} /> : <> </>}
                          <Typography variant="body1" component="span" sx={{ pt: .4, pl: .5 }}>{
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
                }, { children: [], url: '' }).children.reverse()
                }
              </Breadcrumbs>
            </Paper>
          </nav>
          <Paper elevation={6} sx={{ p: 4, flex: '1 1 auto' }}>
            <Outlet />
          </Paper>
        </Container>
      </main>
    </>
  )
}
