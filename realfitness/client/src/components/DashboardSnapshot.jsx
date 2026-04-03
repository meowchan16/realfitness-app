import PropTypes from "prop-types";

function DashboardSnapshot({ workout }) {
  return (
    <section className="snapshot-card">
      <div>
        <p className="snapshot-label">Today&apos;s Plan</p>
        <h3>{workout.name}</h3>
      </div>
      <ul className="snapshot-list">
        {workout.tasks.map((task) => (
          <li key={task}>{task}</li>
        ))}
      </ul>
    </section>
  );
}

DashboardSnapshot.propTypes = {
  workout: PropTypes.shape({
    name: PropTypes.string.isRequired,
    tasks: PropTypes.arrayOf(PropTypes.string).isRequired
  }).isRequired
};

export default DashboardSnapshot;
