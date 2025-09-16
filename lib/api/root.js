'use strict';

function configure () {
  const express = require('express')
    , api = express.Router( )
    , apiConst = require('./const')
    , api3Const = require('../api3/const')
    ;

  api.get('/versions', function getVersion (req, res) {

    const versions = [
      { version: apiConst.API1_VERSION, url: '/api/v1' },
      { version: apiConst.API2_VERSION, url: '/api/v2' },
      { version: api3Const.API3_VERSION, url: '/api/v3' }
    ];

    res.json(versions);
  });

  // New endpoint: /iobcob
  api.get('/iobcob', async function (req, res) {
    try {
      // Context and sandbox setup
      const ctx = req.app.get('ctx');
      const env = req.app.get('env');
      const moment = ctx.moment;
      const language = ctx.language;
      const ddata = ctx.ddata;
      // Initialize sandbox
      const sandboxInit = require('../sandbox');
      const sbx = sandboxInit().serverInit(env, ctx);

      // Load plugins
      const iobPlugin = require('../plugins/iob')(ctx);
      const cobPlugin = require('../plugins/cob')(ctx);

      // Set properties (calculates IOB/COB)
      iobPlugin.setProperties(sbx);
      cobPlugin.setProperties(sbx);

      // Prepare response
      const iob = sbx.properties.iob || {};
      const cob = sbx.properties.cob || {};
      res.json({
        iob: iob.display !== undefined ? iob.display : null,
        cob: cob.display !== undefined ? cob.display : null,
        iob_raw: iob,
        cob_raw: cob
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  return api;
}
module.exports = configure;
