const axios = require('axios');
const key = process.env.GOOGLE_API_KEY;
const moment = require('moment');

const getTripTime = (from, to, mode) => {
  return axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${from.x},${from.y}&destinations=${to.x},${to.y}&key=${key}&mode=${mode}`)
    .then(response => response.data.rows[0].elements[0].duration.value)
    .catch(err => err)
}

const getMultipleTripTime = (path) => {
  const timeOfTrips = path.map(trip => getTripTime(trip[0], trip[1]))
  return Promise.all(timeOfTrips)
    .then(tripTimes => {
      return tripTimes.map((time, index) => ({ start_point: path[index][0], time: time}))
    })
}

// const getDifferentTripTime = (from, destinations) => {
//   let formattedDests = ''
//   for (const destination of destinations) {
//     formattedDests += `|${destination.x},${destination.y}`
//   }
//   formattedDests = formattedDests.substring(1)
//   return axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${from.x},${from.y}&destinations=${formattedDests}&key=${key}&mode=walking`)
//     .then(response => response.data.rows)
//     .catch(err => err)
// }


const getLeaveBy = (origin, event) => {
   return getTripTime(origin, event.destination, event.mode)
    .then(time => {
      return moment(event.start_time).subtract(time, "s")
  })
}

const locationToAddress = (location) => {
  return axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.x},${location.y}&key=${key}`)
   .then(response => {
     const data = response.data.results[0].address_components
     return {
       street: `${data[0].short_name}, ${data[1].short_name}`,
       city: data[3].short_name,
       postalcode: data[7].short_name
     }
 })
 .catch(err => err)
}

// const addressToLocation = ({ street, city, postalcode }) => {
//  return axios.post(`https://maps.googleapis.com/maps/api/geocode/json?address=${location.x},${location.y}&key=${key}`, {
//    }
//  )
//   .then(response => {
//     const { lat, lng } = response.data.results[0].locations[0].latLng
//     return {
//      x: lat,
//      y: lng
//     }
// })
// .catch(err => err)
// }

const rawAddressToLocation = (rawAddress) => {
 return axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(rawAddress)}&key=${key}`)
  .then(response => {
    const { lat, lng } = response.data.results[0].geometry.location
    const data = response.data.results[0].address_components
    return {
      street: `${data[0].short_name}, ${data[1].short_name}`,
      city: data[3].short_name,
      postalcode: data[7].short_name,
      destination : { x: lat, y: lng }
    }
})
.catch(err => err)
}

const formatAddressForDb = (rawAddress) => {
 const formattedAddress = {};
 return rawAddressToLocation(rawAddress)
}

module.exports = {
  getTripTime,
  getMultipleTripTime,
  getLeaveBy,
  locationToAddress,
  formatAddressForDb
};
