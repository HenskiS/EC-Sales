

const Card = ({ src, title, onClick }) => {
    return (
        <div className="card">
            <a href="" onClick={(e) => {
                e.preventDefault();
                onClick();
            }}>
                <img className="card-pic" src={src} alt={title} />
                <h5 className="card-name">{title}</h5>
            </a>
        </div>
    );
}
 
export default Card;
