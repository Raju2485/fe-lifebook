import { Link } from 'react-router-dom'

const Card = ({ obj }) => {
  const role = obj?.Accounts?.[0]?.isAdmin
    ? 'Admin'
    : obj?.Accounts?.[0]?.isMember
      ? 'Member'
      : ''

  return (
    <Link
      className="dashboard-cards business-and-accounts__card"
      to={`${obj.id}/${obj.name}`}
    >
      {role ? (
        <span className="business-and-accounts__card-role">{role}</span>
      ) : null}
      <span className="business-and-accounts__card-name">{obj.name}</span>
    </Link>
  )
}
export { Card }
