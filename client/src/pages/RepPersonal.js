import CigarList from "../components/CigarList";
import { useNavigate } from 'react-router';
import { useEffect } from "react";
import useToken from '../hooks/useToken';
import Home from "./Home";

const RepPersonal = () => {

    const navigate = useNavigate();
    useEffect(() => {
        const tokenString = localStorage.getItem('token');
        const token = (tokenString !== 'undefined') ? tokenString : null;
        if (!token) {
            navigate("/auth");
        }
    });

    let cigars = [
        { 
            brand: "", name: "", blend: "", size: "", qty: "", id: 1
        }
    ]

    return ( 
        <div className="reppersonal">
            <h1>Rep Personal</h1>
            <h4>Cigars</h4>
            {/*{error && <div>{error}</div>}*/}
            {/*isPending && <div>Loading...</div>*/}
            {<CigarList cigars={cigars} displayButton />}
            <div className="submit-order">
                <button className='submit-button'>Submit Order</button>
            </div>
        </div>
    );
}
 
export default RepPersonal;