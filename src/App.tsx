import {ThemeProvider} from '@emotion/react'
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom'
import Layout from './components/layout/Layout'
import './index.css'
import {Theme} from './theme/Theme'
import {Provider} from "react-redux";
import store from "./store";
import Login from './components/auth/Login'
import { lazy, Suspense } from 'react'
import AuthGuard from './components/shared/AuthGuard'

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

const HouseIndexPage = lazy(() => import('./components/houses/HousesIndex'))
const HouseFormPage = lazy(() => import('./components/houses/HouseForm'))

const PeopleIndexPage = lazy(() => import("./components/people/PeopleIndex"))
const PeopleFormPage = lazy(() => import("./components/people/PeopleForm"))

const ReportIndexPage = lazy(() => import("./components/reports/ReportIndex"))

function App() {
    return (
        <Provider store={store}>
            <ThemeProvider theme={Theme}>
                <BrowserRouter basename={"/client"}>
                    <Routes>
                        <Route path="/auth/login">
                            <Route index element={
                                <AuthGuard redirectRoute='/casas' validateLoggedIn={false}>
                                    <Login />
                                </AuthGuard>
                            }/>
                        </Route>
                        <Route element={
                            <AuthGuard redirectRoute='/auth/login'>
                                <Layout links={Links}/>
                            </AuthGuard>
                        }>
                            <Route index element={<Navigate to="/casas"/>}/>
                            <Route path="/casas" element={
                                <Suspense>
                                    <HouseIndexPage />
                                </Suspense>
                            }/>
                            <Route path="/casas/crear" element={
                                <Suspense>
                                    <HouseFormPage />
                                </Suspense>}/>
                            <Route path="/casas/actualizar" element={
                                <Suspense>
                                    <HouseFormPage />
                                </Suspense>}/>
                            <Route path="/personas" element={
                                <Suspense>
                                    <PeopleIndexPage />
                                </Suspense>}/>
                            <Route path="/personas/crear" element={
                                <Suspense>
                                    <PeopleFormPage isForUpdate={false}/>
                                </Suspense>
                            }/>
                            <Route path="/personas/actualizar" element={
                                <Suspense>
                                    <PeopleFormPage isForUpdate={true}/>
                                </Suspense>
                            }/>
                            <Route path="/reportes" element={
                                <Suspense>
                                    <ReportIndexPage/>
                                </Suspense>
                            }/>
                        </Route>
                    </Routes>
                </BrowserRouter>
            </ThemeProvider>
        </Provider>
    )
}

export default App
