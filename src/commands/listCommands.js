const {readActiveCardDetails} = require("../utils/storageHandler");
const {rightPad, getShortUsername, getStatusForSlug, interpolate} = require("../utils/utils");
const {JIRA_CARD_URL, JIRA_SEARCH_URL, DEFAULT_STATUS_PATTERN} = require("../const");
const {readActiveCardKey, readActiveProjectKey, readStatuses} = require("../utils/storageHandler");
const {get} = require("../utils/jiraApi");

const statusCommand = ({pattern}) => {
    const activeCardDetails = readActiveCardDetails();
    const status = interpolate(pattern || DEFAULT_STATUS_PATTERN, activeCardDetails);
    console.log(status || "");
};

const refreshCardCommand = () => {
    const key = readActiveCardKey();
    if (key) {
        loadSingleCard(key);
    } else {
        console.warn("jiraf WARNING: no card set");
    }
};

const listCardsCommand = ({statusSlug, assignee}) => {
    loadCardsOnBoard({statusSlug, assignee}).then(parsedResponse => printCards(parsedResponse));
};

const loadCardsOnBoard = ({statusSlug, assignee}) => {
    const baseSearchUrl =
        JIRA_SEARCH_URL +
        "?fields=summary,status,issuetype,priority,assignee" +
        `&jql=project = ${readActiveProjectKey()} AND Sprint in openSprints()`;
    const filtersUrl = generateFiltersUrl(statusSlug, assignee);
    return get(baseSearchUrl + filtersUrl)
        .then(response => parseBoardResponse(response))
        .catch(error => console.error(`jiraf ERROR: ${error.message}`));
};

const loadSingleCard = key => {
    return get(`${JIRA_CARD_URL}${key}?fields=summary,status,assignee`)
        .then(response => parseCardResponse(response.data))
        .catch(error => console.error(`jiraf ERROR: ${error.message}`));
};

const parseCardResponse = response => {
    return {
        key: response.key,
        summary: response.fields.summary,
        status: response.fields.status.name,
        assignee: response.fields.assignee ? response.fields.assignee.name : null,
    };
};

const generateFiltersUrl = (statusSlug, assignee) => {
    const filterStrings = [""];
    if (statusSlug) {
        const status = getStatusForSlug(statusSlug);
        filterStrings.push(`status = "${status}"`);
    }
    const isAssigneeSwitchSetButNoAssigneeSpecified = assignee === null;
    if (isAssigneeSwitchSetButNoAssigneeSpecified) {
        filterStrings.push(`assignee = ${getShortUsername()}`);
    } else if (assignee === "unassigned") {
        filterStrings.push(`assignee = EMPTY`);
    } else if (assignee) {
        filterStrings.push(`assignee = ${assignee}`);
    }
    return filterStrings.join(" AND ");
};

const parseBoardResponse = response => {
    return response.data.issues
        .map(card => parseCardResponse(card))
        .sort((a, b) => (getIndexForStatus(a.status) < getIndexForStatus(b.status) ? -1 : 1));
};

const printCards = cards => {
    cards.forEach(card => printSingleCard(card));
};

const printSingleCard = card => {
    console.log(formatSingleCardSummary(card));
};

const formatSingleCardSummary = card => {
    return [
        `${card.key}`,
        rightPad(`[${card.status}]`, 13),
        `${card.summary}`,
        `(${card.assignee || "unassigned"})`,
    ].join(" ");
};

const getIndexForStatus = status => {
    return readStatuses().indexOf(status);
};

module.exports = {
    statusCommand,
    refreshCardCommand,
    listCardsCommand,
};
