import { useEffect, useState } from "react";
import CigarList from "../components/CigarList";
import image1 from '../assets/images/devils-hand-box.jpg'
import { useNavigate } from 'react-router';
import { PhotosData } from "../data/PhotosData";
import Card from "../components/Card";
import PhotoInfo from "../components/PhotoInfo";

let cigars = [
    { 
        brand: "", name: "", blend: "", size: "", qty: "", id: 1
    }
]

const Photos = () => {

    const navigate = useNavigate();
    useEffect(() => {
        const tokenString = localStorage.getItem('token');
        const token = (tokenString !== 'undefined') ? tokenString : null;
        if (!token) {
            navigate("/auth");
        }
    });
    
    const [info, setInfo] = useState(false);
    const [infoSrc, setInfoSrc] = useState();

    const getInfo = (infoSrc) => {
        setInfoSrc(infoSrc);
        setInfo(true);
    }


    return ( 
        <>
        <h2>Photos</h2>
        {info? <PhotoInfo index={infoSrc} close={() => setInfo(false)} /> : <></>}
        <div className="photos">
            
            {/*<CigarList cigars={cigars} />*/}
            {/*<img className="photo" src={image1} alt="" />*/}
            {PhotosData.map((photo, index) => (
                <Card 
                    src={photo.src} 
                    title={photo.title} 
                    onClick={() => getInfo(index)}
                />
            ))}
        </div>
        </>
    );
}

export default Photos;