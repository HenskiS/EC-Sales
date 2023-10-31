

const Card = ({ src, title, onClick }) => {
    return (
        <div className="card">
            <a href="" onClick={(e) => {
                e.preventDefault();
                onClick();
            }}>
                <img className="card-pic" src={src} alt={title} />
                
            </a>
            <div className="card-name"><h5 >{title}</h5></div>
        </div>
    );
}
 
export default Card;
