import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../store"
import { selectedLoggedIn, setLoggedIn, setLoggedOut } from "../../store/auth"
import { isLoggedIn } from "../../api/auth"
import { Navigate } from "react-router-dom"

interface Props {
    redirectRoute: string
    children: React.ReactElement,
    validateLoggedIn?: boolean
}

export default function AuthGuard({ children, redirectRoute, validateLoggedIn = true }: Props) {
    const loggedIn = useAppSelector(selectedLoggedIn),
          dispatch = useAppDispatch()

    useEffect(() => {
        if (loggedIn === null) isLoggedIn().then(valid => {
            if(valid) dispatch(setLoggedIn())
            else dispatch(setLoggedOut())
        })
    }, [loggedIn])

    console.log("Is logged in", loggedIn)

    return (
        <>
            {loggedIn !== null && (loggedIn === validateLoggedIn) && children}
            {loggedIn !== null && (loggedIn === !validateLoggedIn) && <Navigate to={redirectRoute}/>}
        </>
    )
}