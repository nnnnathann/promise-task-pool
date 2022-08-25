const pretty = require("eslint-formatter-pretty");

module.exports = async function (results, context) {
  const formattedResults = results.map((result) => {
    return {
      ...result,
      messages: result.messages.map((message) => {
        if (message.ruleId === "import/extensions") {
          message.message = message.message.replace(`"ts"`, `"js"`);
        }
        return message;
      }),
    };
  });
  return pretty(formattedResults, context);
};
