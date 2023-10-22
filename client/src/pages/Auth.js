import { useState, useContext, useEffect } from "react";
import axios from '../api/axios'
import { useCookies } from 'react-cookie';
import {useNavigate} from "react-router-dom";
import PropTypes from 'prop-types';
import AuthContext from "../context/AuthProvider";


const LOGIN_URL = '/auth/login';

const Auth = ({ setToken }) => {
    const { setAuth } = useContext(AuthContext);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errMsg, setErrMsg] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        setErrMsg("")
    }, [username, password]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        try {
            const response = await axios.post(LOGIN_URL, JSON.stringify({ username, password }),
                {
                    headers: { 'Content-Type': 'application/json'},
                    //withCredentials: true
                }
            );
            //setCookies("access_token", response.data.token)
            setToken(response.data.token);
            console.log(JSON.stringify(response?.data));
            const accessToken = response?.data?.accessToken;
            const roles = response?.data?.roles;
            setAuth({ username, password, roles, accessToken})
            localStorage.setItem('userName', JSON.stringify(response.data.name));
            localStorage.setItem('userID', JSON.stringify(response.data.userID));
            //window.localStorage.setItem("userID", response.data.userID);
            navigate("/");
            
        } catch (err) {
            console.error(err);
            if (!err?.response) {
                setErrMsg("No server response");
            } else if (err.response?.status === 400) {
                setErrMsg("Missing Username or Password");
            } else if (err.response?.status === 401) {
                setErrMsg("Unauthorized");
            } else {
                setErrMsg("Login Failed");
            }
        }
    };

    return (
        <div className="auth">
        <div className="auth-container">
            <form>
                <h2>Login</h2>
                {errMsg ? <p>{errMsg}</p> : <></>}
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
