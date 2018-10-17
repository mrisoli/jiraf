const {updateInSession, getActiveProjectKey} = require("../utils/storageHandler");

const setProjectCommand = options => {
    const key = options.project;
    updateInSession([["active_project_key", key]]);
};

const unsetProjectCommand = () => {
    updateInSession([["active_project_key", ""]]);
};

const setCardCommand = options => {
    const key = options.card;
    let fullKey;
    if (key.indexOf("-") !== -1) {
        const cardProject = key.split("-")[0];
        setProjectCommand(cardProject);
        fullKey = key;
    } else {
        fullKey = getActiveProjectKey() + "-" + key;
    }
    updateInSession([["active_card_key", fullKey]]);
};

const unsetCardCommand = () => {
    updateInSession([["active_card_key", ""], ["active_card_summary", ""]]);
};

module.exports = {
    setProjectCommand,
    unsetProjectCommand,
    setCardCommand,
    unsetCardCommand,
};
