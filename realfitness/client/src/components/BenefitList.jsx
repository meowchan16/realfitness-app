import PropTypes from "prop-types";

function BenefitList({ items }) {
  return (
    <ul className="benefit-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

BenefitList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default BenefitList;
