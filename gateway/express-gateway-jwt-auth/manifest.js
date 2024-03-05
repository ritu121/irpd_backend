module.exports = {
    version: '1.2.0',
    init: function (pluginContext) {
      pluginContext.registerPolicy(require('./policies/jwt-auth.js'));
      
    },
    policies:['jwt-auth'], // this is for CLI to automatically add to "policies" whitelist in gateway.config
    schema: {  // This is for CLI to ask about params 'eg plugin configure example'
      $id: "http://express-gateway.io/schemas/plugin-configure-example.json",
    }
  };