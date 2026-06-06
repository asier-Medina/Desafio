import { useState, useEffect } from 'react';
import './PaginatedGrid.css';

export default function PaginatedGrid({ items, limit, renderItem, emptyMessage }) {
  const [visible, setVisible] = useState(limit);

  useEffect(() => {
    setVisible(limit);
  }, [limit]);

  if (items.length === 0) {
    return <p className="paginated-grid__empty">{emptyMessage}</p>;
  }

  const shown = items.slice(0, visible);
  const remaining = items.length - visible;

  return (
    <>
      <ul className="paginated-grid__list">
        {shown.map((item) => (
          <li key={item.id} className="paginated-grid__item">
            {renderItem(item)}
          </li>
        ))}
      </ul>
      {remaining > 0 && (
        <div className="paginated-grid__footer">
          <button
            type="button"
            className="paginated-grid__btn"
            onClick={() => setVisible((v) => v + limit)}
          >
            Ver más · {remaining} {remaining === 1 ? 'resultado' : 'resultados'}
          </button>
        </div>
      )}
    </>
  );
}
