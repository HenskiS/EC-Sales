import { useEffect, useState } from "react";
import { useLocation } from "react-router";

const ShowNavBar = ({ children }) => {

    const location = useLocation();

    const [showNavBar, setShowNavBar] = useState(false);

    useEffect(() => {
        setShowNavBar(location.pathname !== '/auth')
    }, [location])

    return (
        <div>{showNavBar && children}</div>
    )

}

export default ShowNavBar