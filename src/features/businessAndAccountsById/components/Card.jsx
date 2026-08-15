import { Link, Navigate } from 'react-router-dom'
const Card = ({ obj }) => {
  // return (
  //   <Link className="dashboard-cards" to={obj.redirectUrl}>
  //     {obj.name}
  //   </Link>
  // )
  return (
    <Link className="dashboard-cards" to={`${obj.id}`}>
      {obj.name}
    </Link>
  )
}
export { Card }
