import { Fragment, useEffect, useState } from "react";
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
    
    const [info, setInfo] = useState(false);
    const [infoSrc, setInfoSrc] = useState();

    const getInfo = (infoSrc) => {
        setInfoSrc(infoSrc);
        setInfo(true);
    }


    return ( 
        <div className='content'>
            <h2>Photos</h2>
            {info? <PhotoInfo index={infoSrc} close={() => setInfo(false)} /> : <></>}
            <div className="photos">
                
                {/*<CigarList cigars={cigars} />*/}
                {/*<img className="photo" src={image1} alt="" />*/}
                {PhotosData.map((photo, index) => (
                    <Card 
                        key={index}
                        src={photo.src} 
                        title={photo.title} 
                        onClick={() => getInfo(index)}
                    />
                ))}
            </div>
        </div>
    );
}

export default Photos;