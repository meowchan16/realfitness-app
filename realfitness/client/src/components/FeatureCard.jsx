import PropTypes from "prop-types";

function FeatureCard({ label, title, description }) {
  return (
    <article className="feature-card">
      <span className="feature-label">{label}</span>
      <strong>{title}</strong>
      <p>{description}</p>
    </article>
  );
}

FeatureCard.propTypes = {
  label: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired
};

export default FeatureCard;
