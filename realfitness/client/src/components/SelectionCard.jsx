import PropTypes from "prop-types";

function SelectionCard({ title, description, isActive, onClick }) {
  return (
    <button
      type="button"
      className={`selection-card ${isActive ? "selection-card--active" : ""}`}
      onClick={onClick}
    >
      <strong>{title}</strong>
      <p>{description}</p>
    </button>
  );
}

SelectionCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired
};

export default SelectionCard;
