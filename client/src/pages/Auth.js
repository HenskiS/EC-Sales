import { useState, useContext, useEffect } from "react";
import axios from '../api/axios'
import {config} from "../api/axios.js";
import { useCookies } from 'react-cookie';
import {useNavigate} from "react-router-dom";
import PropTypes from 'prop-types';
import AuthContext from "../context/AuthProvider";
import jwtDecode from 'jwt-decode'

const LOGIN_URL = '/api/auth/';

const Auth = ({ setToken }) => {
    const credentials = JSON.parse(localStorage.getItem('credentials'))

    const { setAuth } = useContext(AuthContext);
    const [username, setUsername] = useState(credentials? credentials.username : "");
    const [password, setPassword] = useState(credentials? credentials.password : "");
    const [remember, setRemember] = useState(credentials? true : false);
    const [errMsg, setErrMsg] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        setErrMsg("")
    }, [username, password]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        try {
            const token = JSON.parse(sessionStorage.getItem('token'));
            const response = await axios.post(LOGIN_URL, JSON.stringify({ username, password }),
                {
                    headers: { 'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`},
                    withCredentials: true
                }
            );
            //console.log(response);
            //setCookies("access_token", response.data.token)
            setToken(response.data.accessToken);
            // set cookie

            const UserInfo = jwtDecode(response.data.accessToken).UserInfo
            sessionStorage.setItem('accessToken', JSON.stringify(jwtDecode(response.data.accessToken)));
            console.log(JSON.stringify(response?.data));
            const accessToken = response?.data?.accessToken;
            const roles = response?.data?.roles;
            setAuth({ username, password, roles, accessToken})
            //localStorage.setItem('userName', JSON.stringify(response.data.name));
            //localStorage.setItem('userID', JSON.stringify(response.data.userID));
            sessionStorage.setItem('UserInfo', JSON.stringify(UserInfo));
            
            if (remember) {
                localStorage.setItem('credentials', JSON.stringify({username, password}))
            } else {
                localStorage.clear()
            }
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
            } else if (err.response?.status === 429) {
                setErrMsg("Too many requests, please wait 1 minute");
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
                {errMsg ? <p className="errMsg">{errMsg}</p> : <></>}
                <div className="form-group">
                    <label htmlFor="username"> Username: </label>
                    <input type="text" id="username" onChange={(e) => setUsername(e.target.value)} defaultValue={username} />
                </div>
                <div className="form-group">
                    <label htmlFor="password"> Password: </label>
                    <input type="password" id="password" onChange={(e) => setPassword(e.target.value)} defaultValue={password} />
                </div>
                <div style={{margin: "10px 0px"}}>
                    <input type="checkbox" id="remember" onChange={(e) => setRemember(!remember)} defaultChecked={remember} />
                    <label htmlFor="remember"> Remember Me </label>
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
