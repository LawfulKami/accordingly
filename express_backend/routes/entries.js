const express = require('express');
const router = express.Router();




module.exports = ({ makeEntryInactive }) => {

  router.delete('/:id', function (req, res) {
    makeEntryInactive(req.params.id)
      .then(data => res.json(`Sucessfully updated entry : id '${data.id} '${data.title}' to be inactive`))
  })


  return router;
}