import { useState } from 'react';
import { useEffect } from 'react';
import CigarList from '../components/CigarList';
import CigarOrderList from '../components/CigarOrderList';
import useFetch from '../hooks/useFetch';
import useToken from '../hooks/useToken';
import { useNavigate } from 'react-router';

const Home = () => {

    const navigate = useNavigate();
    useEffect(() => {
        const tokenString = localStorage.getItem('token');
        const token = (tokenString !== 'undefined') ? tokenString : null;
        if (!token) {
            navigate("/auth");
        }
    });

    /*const { data: cigars, isPending, error } = useFetch('http://localhost:8000/cigars');*/

    const previousCigars= [
        { 
            brand: "Esteban Carreras", name: "Hellcat", blend: "Oscuro", size: "toro", qty: 6, discount: 5, id: 1
        },
        { 
            brand: "Bloodline", name: "Devils Hand", blend: "Melodioso", size: "robusto", qty: 2, discount: 3.5, id: 2 
        },
        { 
            brand: "Cuba Real", name: "Gooding Real", blend: "Sabroso", size: "double toro", qty: 4, discount: 7, id: 3 
        }
    ];
    const cigars = [];
        /*{ 
            brand: "", name: "", blend: "", size: "", qty: "", id: 1
        }
    ]*/
    const c = {
        brand: "Esteban Carreras",
        name: "10 Anos",
        blend: "Maduro",
        sizeName: "Churchill"
    }
    


    return ( 
        <div className='home'>
            <h1>Client Order Form</h1>
            {/* Client and Salesman Info */}
            <div className="client-and-salesrep">
                <div className="client">
                    <input type='text' className='cust-input' placeholder='John Smoker'></input>
                    <p>949-555-0179 <br /> 124 Conch St. <br /> San Clemente <br /> CA 92673</p>
                </div>
                <div className="salesrep">
                    <p>Esteban Carreras <br /> 915 Calle Amanecer <br /> San Clemente <br /> CA 92673 <br /> Joe Salesman <br /> joe@estebancarreras.com <br /> </p>
                </div>
            </div>
            <h4>Cigars</h4>
            {/*{error && <div>{error}</div>}*/}
            {/*isPending && <div>Loading...</div>*/}
            {cigars && <CigarOrderList cigars={cigars} displayButton />}
            <hr />
            {/*<div className="subtotal">
                <h5>Subtotal</h5>
                <p>$560.57{}</p>
                <h4>Total (with taxes and discount)</h4>
                <p className='total'>$542.46</p>
            </div>*/}
            
            <div className="submit-order">
                <button className='submit-button'>Submit Order</button>
            </div>
            <hr />
            <h4>Previously Ordered Cigars</h4>
            {/*previousCigars && <CigarList cigars={previousCigars} />*/}
        </div>
    );
}

export default Home;
