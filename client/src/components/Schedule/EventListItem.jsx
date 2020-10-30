import React, { useState } from 'react';
import moment from 'moment';
import { getWeatherIcon } from '../../helpers/selectors';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faClock, faTrash } from '@fortawesome/free-solid-svg-icons';

import RepeatList from './RepeatList';
import { Button } from '../Button'

const NORMAL = 'normal';
const DELETE = 'delete';

export default function EventListItem(props) {
  const [toggle, setToggle] = useState(false);
  const [view, setView] = useState(NORMAL);


  const cancel = () => {
    if (view === NORMAL) {
      setView(DELETE);
    } else {
      props.deleteEvent(props.type, props.id)
    }
  };

  const back = () => setView(NORMAL);
  const edit = () => console.log('edit click');

  return (
    <li>
      <div onClick={() => setToggle(!toggle)}>
        <FontAwesomeIcon icon={getWeatherIcon(props.weather)} />
        <p>{props.type === 'today' ? moment(props.start).format('h:mm a') : moment(props.start).fromNow()} {props.title}</p>
      </div>
      {toggle &&
        <div onClick={() => setToggle(false)}>
          <div>
            <FontAwesomeIcon icon={faMapMarkerAlt} />
            <p>{props.destination}</p>
          </div>
          <div>
            <FontAwesomeIcon icon={faClock} />
            <div>
              <p> {moment(props.start).format('dddd, MMM Do   h:mm a')}</p>
              <p> {moment(props.end).format('dddd, MMM Do   h:mm a')}</p>
            </div>
          </div>
          {
            props.recurrences ?
              <RepeatList recurrences={props.recurrences} /> : <div><p> Does not repeat </p></div>
          }
          {
            view === NORMAL ?
              <div>
                <Button onClick={() => props.onEdit(props.entry_id)}>Edit</Button>
                <Button onClick={cancel}><FontAwesomeIcon icon={faTrash} /></Button>
              </div> :
              <div>
                <Button onClick={back}>Back</Button>
                <Button onClick={cancel}>Confirm Delete</Button>
              </div>
          }
        </div>
      }
    </li>
  );
};