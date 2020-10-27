const axios = require('axios');

// MAPQUEST developerAPI
const host = "http://www.mapquestapi.com/"
const key = "AiWSvQStB39c9CB4ftDVnYgHANMxQbEx"



const locationToAddress = (location) => {
   return axios.get(`${host}geocoding/v1/reverse?key=${key}&location=${location.x},${location.y}`)
    .then(response => {
      const { street, adminArea5, adminArea3, adminArea1, postalCode } = response.data.results[0].locations[0]
      return {
        street,
        city: adminArea5,
        state: adminArea3,
        country: adminArea1,
        postalcode: postalCode
      }
  })
  .catch(err => err)
}


module.exports = {
  locationToAddress,
};