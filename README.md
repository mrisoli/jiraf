# jiraf

jiraf is a command-line helper for a workflow based in Atlassian Jira and GitHub.  
[![jiraf on npmjs](https://img.shields.io/npm/v/jiraf.svg?colorB=blue)](https://www.npmjs.com/package/jiraf)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![CircleCI](https://circleci.com/gh/endreymarcell/jiraf.svg?style=svg)](https://circleci.com/gh/endreymarcell/jiraf)
[![Greenkeeper badge](https://badges.greenkeeper.io/endreymarcell/jiraf.svg)](https://greenkeeper.io/)
[![dependencies Status](https://david-dm.org/endreymarcell/jiraf/status.svg)](https://david-dm.org/endreymarcell/jiraf)


__Note: jiraf is in beta. Please report any issues.__  

## Setup

### Install
```bash
npm install -g jiraf
```  

### Authorize
Create an Atlassian API token: navigate to https://id.atlassian.com/ and take note of your username, click API tokens and create a new token for yourself. Then export them:  
```
export ATLASSIAN_USERNAME=your.name@email.com
export ATLASSIAN_API_TOKEN=your_atlassian_token
```  

If you also want to create pull requests, you need GitHub credentials as well: navigate to https://github.com/settings/tokens and generate a new token - repo access is enough, but you'll also need to enable SSO for it to be able to access your organization.  
```
export GITHUB_USERNAME=your.name@email.com
export GITHUB_API_TOKEN=your_github_token
```  
Put these exports into your bash_profile so that they persist between terminal sessions.

### Configure
Edit `~/.jiraf/config.json` to add your Jira URL base, editor, and possibly customize your shortcuts.  
(Make sure that your editor waits for closing files before returning, eg. `vim`, `subl -w`, `atom -w` etc. Hint: check `git config core.editor`.)  

You will probably want to include some information about the current card in your shell prompt like people do with their git branches. To do that, just cat the contents of the `~/.jiraf/status` file, eg. with a function like this one:  
```bash
function jiraf_card() {
    [ -f ~/.jiraf/status ] && cat ~/.jiraf/status
}
```
The format of this status is configurable by modifying the `statusTemplate` value of the `~/.jiraf/config.json` file. See the `details` command for the format.  

## Usage

### Base commands

#### Picking a card  
`jiraf setproject <project_key>`  
Specify the project by its key so that you can list cards on the board.    

`jiraf unsetproject`  
Unset the project.  

`jiraf ls [-s|--status <status>] [-a|--assignee [<username>]]`  
List the cards on the board in the current sprint (key, status, summary, assignee).  
You can filter for status (lowercase, one word, like: "todo" or "inprogress") or assignee (pass the Jira username). If you don't pass any username, the default is yourself; to filter for unassigned cards, pass "unassigned".    

`jiraf set <card>`  
Set `<card>` as the active card. (Note: you can pass the full key, eg. PROJ-123, which then also calls `setproject` with "PROJ", or only pass 123, in which case the currently active project is used.)  

`jiraf details [<template>]`  
Print the details of the active card. The format is specified in your config file (see the `detailsTemplate` value), but you can also override it when calling the command. You can use the values `summary`, `status`, `assignee`, `description`, `priority`, and `estimate` passed to the template in double curly braces. If you don't pass anything and also have no template configured, the default template is used, which is `{{key}} [{{status}}] {{summary}} ({{assignee}})`.  

`jiraf refresh`  
Reload the current card (eg. if you've updated it on the web UI).  
  
`jiraf unset`  
Unset the currently active card.  

#### Updating a card  
`jiraf move <status>`  
Update the active card to `<status>` (one of: blocked, todo, inprogress, review, validation, done).  

`jiraf assign [<username>]`  
Assign the active card to `<username>`, default is assigning to yourself.  

`jiraf unassign`  
Remove assignee from the card.  

#### git and GitHub
`jiraf branch <branchname>`  
Performs `git checkout -b {active-cards-key}-<branchname>`.    

`jiraf check`  
Checks if the active card has one or more Pull Requests associated with it, and if yes, prints their URLs.  

`jiraf pr`  
Opens a text editor for you to specify the PR title and contents, based on a template and pre-filled with card details. The first line is the title, the rest is the description. Upon closing the file, it opens a PR. Note: this command only works properly if you have configured an editor that is blocking until the edited file is closed.  

`jiraf web [<target>]`  
Opens Jira views in the browser, target is one of: board (default), card, backlog.  
Note: if you call `jiraf` without arguments, `jiraf web` (and consequently `jiraf web board`) is executed.  

### Compound commands (shortcuts)
The following shortcuts are defined for a smoother workflow:  
`start <card> == set <card> + assign + move inprogress`  
`review == move review + pr`  
`qa == move validation + assign YOUR_QA_PERSON`
You could get through the entire workflow of choosing, picking up, and delivering a card with only these three.

You can specify more shortcuts in your `~/.jiraf/config.json` file.  

### Contributing
Run tests locally by calling `npm test [pattern]`. The tests will run in a docker container.    
You can also call `npm run debug` which runs the docker container with the code mounted and the mock services for JIRA and GitHub running.  

## Have fun!
![Photo by Rajiv Bajaj on Unsplash](giraffe.jpg)
