import { PhotosData } from "../data/PhotosData";
import { IoIosClose, IoIosArrowBack } from "react-icons/io"
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { useEffect } from "react";


const PhotoInfo = ({ index, close }) => {
    const data = PhotosData[index]
    useEffect(() => {
        window.scrollTo(0, 80)
    }, [])

    return (
        <>
        {/*<div className="greybackground"></div>*/}
        <div className="PhotoInfo">
            {/* Replace line below with image carousel */}
            {/*<img className="card-pic" src={data.src[0]} alt="" />*/}
            <Carousel width={"600px"}  >
                {data.src.map( (src, i) => (
                        <div key={i}>
                            <img src={src} alt="" />
                            {data.hasOwnProperty("captions")? data.captions[i]===""?<></>:<p className="legend">{data.captions[i]}</p> : <></>}
                        </div>
                    ) )}
            </Carousel>
            {/*<h5>Info for Card {index}</h5>*/}
            <IoIosArrowBack onClick={close} />
            <div className="photoinfo-description">{data.description}</div>
        </div>
        </>
    );
}
 
export default PhotoInfo;
