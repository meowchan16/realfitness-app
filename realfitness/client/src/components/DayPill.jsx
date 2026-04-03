import PropTypes from "prop-types";

function DayPill({ day, isActive, isToday, onClick }) {
  return (
    <button
      type="button"
      className={`day-pill ${isActive ? "day-pill--active" : ""} ${
        isToday ? "day-pill--today" : ""
      }`}
      onClick={onClick}
    >
      <span>{day}</span>
      {isToday ? <strong>Today</strong> : null}
    </button>
  );
}

DayPill.propTypes = {
  day: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  isToday: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired
};

export default DayPill;
