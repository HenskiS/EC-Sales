import { PhotosData } from "../data/PhotosData";
import { IoIosClose } from "react-icons/io"


const PhotoInfo = ({ index, close }) => {
    const data = PhotosData[index]

    return (
        <div className="PhotoInfo">
            <img className="card-pic" src={data.src} alt="" />
            <h5>Info for Card {index}</h5>
            <IoIosClose onClick={close} />
            <p>{data.description}</p>
        </div>
    );
}
 
export default PhotoInfo;
