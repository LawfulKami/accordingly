const moment = require('moment');
const { getLeaveBy } = require('../APIs/google_map');
const { getForecastCategory } = require('../APIs/open_weather')
const db = require('../db');
const dataQ = require('../models')(db);

const createEventList = (rawEvents, id) => {
  return dataQ.getUserLocationById(id)
    .then(origin => todayFormatting(rawEvents[0], rawEvents[1], origin))
    .then(today => {
      return {
        today: today,
        repeating : groupByEntry(rawEvents[1].map(event => ({...event, next_event: getNextEventFromRec(event)}))) || [],///needs refatoring
        future : rawEvents[2]
      };
    })
    .then(eventList => {
      const todayWeather = eventList.today.map(event => getForecastCategory(event))
      const nextEventWeater = eventList.repeating.map(event => getForecastCategory(event.next_event))
      const futureWeater = eventList.future.map(event => getForecastCategory(event))
      const promisedWeather = [ todayWeather, nextEventWeater, futureWeater ]
      return Promise.all(promisedWeather.map(weather => Promise.all(weather)))
        .then(allWeather => {
          return {
            today : eventList.today.map((event, index) => ({...event, weather : allWeather[0][index]})),
            repeating : eventList.repeating.map((event, index) => ({...event, next_event : ({...event.next_event, weather : allWeather[1][index]})})),
            future : eventList.future.map((event, index) => ({...event, weather : allWeather[2][index]}))
          }
        })
    })
    .catch(err => console.log(err))
};

const getRecurrenceArray = (event, list) => {
  for (const rec of list.repeating) {
    if (event.entry === rec.entry) {
      return rec
    }
  }
}

const todayFormatting = (rawToday, rawRec, origin) => {
  const today = rawToday.concat(checkReocsToday(rawRec)).map(event => {
    if (!event.start_time){
      const start_time = getTodayRecStartTime(event);
      const end_time = getTodayRecEndTime(event);
      return ({
      ...event,
        start_time,
        end_time
      })
    }
  })
  const leaveBys = today.map(event => getLeaveBy(origin, event));
  return Promise.all(leaveBys)
  .then(departures => today.map((event, index) => {
      return ({
        ...event,
        leave_by: moment(departures[index]).format()
      })
  }))
};


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
    const { entry, start_hour, end_hour, start_date, end_date, entry_id, is_from_start_date, destination } = grouping[0];
    const group = {
      entry,
      entry_id,
      start_date,
      end_date,
      start_hour,
      end_hour,
      is_from_start_date,
      next_event : {
        start_time : getFirstEventTime(grouping).format("YYYY-MM-DD") + "T" + start_hour,
        end_time : getFirstEventTime(grouping).format("YYYY-MM-DD") + "T" + end_hour,
        destination
      },
      recurrences : []
    }
    
    for (const event of grouping) {
      const rec = {
        id: event.id,
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


const getTodayRecStartTime = (rec) => {
  return moment().format("YYYY-MM-DD") + "T" + rec.start_hour;
}

const getTodayRecEndTime = (rec) => {
  return moment().format("YYYY-MM-DD") + "T" + rec.end_hour;
}

const updateTodayToNow = (today) => {
  return today.filter(event => {
    if(today.start_time) {
      return moment(event.start_date) > moment();
    } else {
      return moment(getTodayRecStartTime(event)) > moment();
    }
  })
}


const getFirstEventTime = (events) => {
  let firstEventTime = events[0].next_event;
  for (const event of events) {
    if (event.next_event < firstEventTime) {
      firstEventTime = event.next_event;
    }
  }
  return firstEventTime;
}




const getTripsToday = (today, origin) => {

}


module.exports = {
  createEventList,
  checkReocsToday,
  getNextEventFromRec,
  getTodayRecStartTime,
  updateTodayToNow
};
