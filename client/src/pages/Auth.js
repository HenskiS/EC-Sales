import { useState } from "react";
import axios from "axios";
import { useCookies } from 'react-cookie';
import {useNavigate} from "react-router-dom";
import PropTypes from 'prop-types';

/*const Auth = () => {
    return ( 
        <div className="auth">
            <Login />
        </div>
     );
}*/

const Auth = ({ setToken }) => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    //const [_, setCookies] = useCookies(["access_token"]);

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        try {
            const response = await axios.post("http://localhost:3001/auth/login", { username, password });
            //setCookies("access_token", response.data.token)
            setToken(response.data.token);
            console.log("setToken");
            localStorage.setItem('userName', JSON.stringify(response.data.name));
            localStorage.setItem('userID', JSON.stringify(response.data.userID));
            //window.localStorage.setItem("userID", response.data.userID);
            navigate("/");
            
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="auth">
        <div className="auth-container">
            <form>
                <h2>Login</h2>
                <div className="form-group">
                    <label htmlFor="username"> Username: </label>
                    <input type="text" id="username" onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="password"> Password: </label>
                    <input type="password" id="password" onChange={(e) => setPassword(e.target.value)} />
                </div>

                <button onClick={handleSubmit}>Login</button>

            </form>
        </div>
        </div>
    )
}

Auth.propTypes = {
    setToken: PropTypes.func.isRequired
}

export default Auth;
