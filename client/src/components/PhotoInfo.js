import { PhotosData } from "../data/PhotosData";
import { IoIosClose, IoIosArrowBack } from "react-icons/io"
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader



const PhotoInfo = ({ index, close }) => {
    const data = PhotosData[index]

    return (
        <>
        {/*<div className="greybackground"></div>*/}
        <div className="PhotoInfo">
            {/* Replace line below with image carousel */}
            {/*<img className="card-pic" src={data.src[0]} alt="" />*/}
            <Carousel width={"600px"}>
                <div>
                    <img src={data.src[0]} alt="" />
                    <p className="legend">First slide label</p>
                </div>
                <div>
                    <img src={data.src[1]} alt="" />
                    <p className="legend">Second slide label</p>
                </div>
                <div>
                    <img src={data.src[2]} alt="" />
                    <p className="legend">Third slide label</p>
                </div>
            </Carousel>
            {/*<h5>Info for Card {index}</h5>*/}
            <IoIosArrowBack onClick={close} />
            <p className="photoinfo-description">{data.description}</p>
        </div>
        </>
    );
}
 
export default PhotoInfo;
