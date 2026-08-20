
const CTruncateText = ({ text='' }) => {

    return (
        <span className="heightThreeDots" title={text}>
            {text}
        </span>
    )
}
export default CTruncateText
