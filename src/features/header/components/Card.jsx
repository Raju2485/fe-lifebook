import { Link } from 'react-router-dom'
const Card = ({ obj }) => {
  return <Link className="dashboard-cards" to={obj.redirectUrl}>{obj.name}</Link>
}
export { Card }