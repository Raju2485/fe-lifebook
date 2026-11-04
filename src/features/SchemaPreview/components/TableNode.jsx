import { Handle, Position } from 'reactflow'

export default function TableNode({ data = {} }) {
  const columns = Array.isArray(data.columns) ? data.columns : []
  const associations = Array.isArray(data.associations)
    ? data.associations
    : []

  return (
    <div className="table-node">
      <Handle
        type="target"
        position={Position.Top}
        id="target-top"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="target-left"
      />

      <div className="table-header">
        {data.tableName ?? data.name ?? 'Table'}
      </div>

      <div className="columns">
        {columns.map((col, index) => (
          <div key={col.name ?? `col-${index}`} className="column-row">
            <div>
              {col.primaryKey && '🔑 '}
              {col.foreignKey && '🔗 '}
              {col.name}
            </div>

            <div>{col.type}</div>

            <div>
              {!col.allowNull && 'NOT NULL '}
              {col.unique && 'UNIQUE '}
            </div>

            {col.references && (
              <div
                style={{
                  fontSize: '11px',
                  color: '#888',
                }}
              >
                →{col.references.table}.{col.references.key}
              </div>
            )}

            {col.validations?.length > 0 && (
              <div
                style={{
                  fontSize: '10px',
                  color: '#4caf50',
                }}
              >
                {col.validations.map((v, vIndex) => (
                  <div key={`${v.rule ?? 'rule'}-${vIndex}`}>{v.rule}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="associations">
        {associations.map((a, index) => (
          <div
            key={`${a.type}-${a.target}-${a.as ?? a.through ?? ''}-${index}`}
          >
            {a.type}
            {' → '}
            {a.target}
            {a.as ? ` (${a.as})` : ''}
          </div>
        ))}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="source-right"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="source-bottom"
      />
    </div>
  )
}
