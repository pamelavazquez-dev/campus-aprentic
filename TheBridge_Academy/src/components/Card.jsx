import React, { memo } from 'react'

const Card = memo(function Card({ children }) {
  return (
    <article>
      {children}
    </article>
  )
});

export default Card;
