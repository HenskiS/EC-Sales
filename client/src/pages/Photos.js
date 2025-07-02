import { Fragment, useEffect, useState } from "react";
import { PhotosData } from "../data/PhotosData";
import Card from "../components/Card";
import PhotoInfo from "../components/PhotoInfo";


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
            {info? <PhotoInfo index={infoSrc} close={() => setInfo(false)} /> : //<></> }
            <div className="photos">
                
                {PhotosData.map((photo, index) => (
                    <Fragment key={index}>{photo.title === "" ? <></> :
                    <Card 
                        src={photo.src[0]} 
                        title={photo.title} 
                        onClick={() => getInfo(index)}
                    />
                    }</Fragment>
                ))}
            </div>
            }
        </div>
    );
}

export default Photos;