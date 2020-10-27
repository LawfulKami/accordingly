const moment = require('moment');

const createEventList = (rawEvents) => {
  return {
    today: rawEvents[0].concat(checkReocsToday(rawEvents[1])).map(event => ({...event, weather : null })),
    repeating : groupByEntry(rawEvents[1].map(event => ({...event, next_event: getNextEventFromRec(event) }))) || [],
    future : rawEvents[2].map(event => ({...event, weather : null }))
  };
};

const getRecurrenceArray = (event, list) => {
  for (const rec of list.repeating) {
    if (event.entry === rec.entry) {
      return rec
    }
  }
}


const groupByEntry = (events) => {
  const result = [];
  const distinctEvents = [];
  for (const event of events) {
    if (!distinctEvents.includes(event.entry_id)) {
      distinctEvents.push(event.entry_id)
    }
  }
  for (const id of distinctEvents) {
    const grouping = events.filter(event => event.entry_id === id)
    const { entry, start_time, end_time, start_date, end_date, entry_id, is_from_start_date, destination } = grouping[0];
    const group = {
      entry,
      entry_id,
      destination,
      start_date,
      end_date,
      start_time,
      end_time,
      is_from_start_date,
      next_event : getFirstEventTime(grouping),
      next_weather : null,
      recurrences : []
    }
    
    for (const event of grouping) {
      const rec = {
        type_of : event.type_of,
        initial : event.initial,
        interval : event.interval,
      }
      group.recurrences.push(rec)
    }
    result.push(group)
  }
  return result
}


const checkDayToday = (reoc, day) => {
  const fromInitial =  moment().dayOfYear() - moment(reoc.initial).dayOfYear()
  return (fromInitial % reoc.interval === 0)
};

const checkWeeklyToday = (reoc, day) => {
  const fromInitial =  moment().week() - moment(reoc.initial).week()
  return (moment(reoc.initial).day() === moment().day() && fromInitial % reoc.interval === 0)
};

const checkMonthlyToday = (reoc, day) => {
  const fromInitial =  moment().month() - moment(reoc.initial).month()
  return (moment(reoc.initial).date() === moment().date() && fromInitial % reoc.interval === 0)
};

const checkYearlyToday = (reoc, day) => {
  const fromInitial =  moment().year() - moment(reoc.initial).year()
  return (moment(reoc.initial).dayOfYear() === moment().dayOfYear() && fromInitial % reoc.interval === 0)
};

const checkReocsToday = (reocs, day) => {

  return reocs.filter((reoc) => {

    switch (reoc.type_of) {
      case 'daily':
        return checkDayToday(reoc);
      case 'weekly':
        return checkWeeklyToday(reoc);
      case 'monthly':
        return checkMonthlyToday(reoc);
      case 'yearly':
        return checkYearlyToday(reoc);
    }
  })
}

const getNextEventFromRec = (reoc) => {
  switch (reoc.type_of) {
    case 'daily':
      const fromInitialDay =  moment().dayOfYear() - moment(reoc.initial).dayOfYear();
      const cycleDay = Math.floor(fromInitialDay/reoc.interval) + 1;
      return moment(reoc.initial).add(cycleDay * reoc.interval,'d');
    case 'weekly':
      const fromInitialWeek =  moment().week() - moment(reoc.initial).week();
      let cycleWeek = Math.floor(fromInitialWeek/reoc.interval);
      if (moment().day() >= moment(reoc.initial).day()) {
        cycleWeek ++;
      };
      return moment(reoc.initial).add(cycleWeek * reoc.interval,'w');
    case 'monthly':
      const fromInitialMonth =  moment().month() - moment(reoc.initial).month();
      const cycleMonth = Math.floor(fromInitialMonth/reoc.interval);
      if (moment().date() >= moment(reoc.initial).date()) {
        cycleMonth ++;
      };
      return moment(reoc.initial).add(cycleMonth * reoc.interval,'M');
    case 'yearly':
      const fromInitialYear =  moment().year() - moment(reoc.initial).year();
      const cycleYear = Math.floor(fromInitialYear/reoc.interval);
      if (moment().dayOfYear() >= moment(reoc.initial).dayOfYear()) {
        cycleYear ++;
      };
      return moment(reoc.initial).add(cycleYear * reoc.interval,'y');
  }
}

const updateTodayToNow = (today) => {
  if(!today.start_time) {
    return today.filter(event => moment(event.start_date) > moment())
  } else {
    return today.filter(event => event.start_time > moment())
  }
}


const getFirstEventTime = (events) => {
  let firstEventTime = events[0].next_event
  for (const event of events) {
    if (event.next_event < firstEventTime){
      firstEventTime = event.next_event
    }
  }
  return firstEventTime
}

module.exports = {
  createEventList,
  checkReocsToday,
  getNextEventFromRec
};
