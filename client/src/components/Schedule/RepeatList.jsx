import React from 'react';

import RepeatListItem from './RepeatListItem'

export default function RepeatList(props) {
  const items = props.recurrences.map(reccurence => {
    return <RepeatListItem
    key={reccurence.id}
    frequency={reccurence.type_of}
    initial={reccurence.initial}
    interval={reccurence.interval}
    />
  });
  return (
    <ul className='repeat'>
      <p className='repeat-title'>Repeats</p>
      {items}
    </ul>
  )
};