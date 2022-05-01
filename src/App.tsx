import { ThemeProvider } from '@emotion/react'
import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import HouseForm from './components/houses/HouseForm'
import HousesIndex from './components/houses/HousesIndex'
import Layout from './components/layout/Layout'
import './index.css'
import { Theme } from './theme/Theme'

const Links = [
  {
    label: 'Casas',
    href: '/casas'
  },
  {
    label: 'Personas',
    href: '/personas'
  },
  {
    label: 'Reportes',
    href: '/reportes'
  }
]

function App() {
  return (
    <ThemeProvider theme={Theme}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout links={Links} />}>
            <Route index element={<div>Este es el home</div>} />
            <Route path="/casas" element={<HousesIndex />} />
            <Route path="/casas/crear" element={<HouseForm />} />
            <Route path="/personas" element={<div>Estas son las personas</div>} />
            <Route path="/reportes" element={<div>Estos son los reportes</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
