# tagpro-stats-player-chart

Add a radar/bar chart to http://tagpro-stats.com profiles. Good for quickly comparing yourself against other players.

![GitHub Logo](/images/radar-chart.png)

## Install

CLICK HERE: **https://keratagpro.github.io/tagpro-stats-player-chart/tagpro-stats-player-chart.user.js**

(requires [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en))

## Features

* Select between radar and bar chart
* Toggle career and monthly stats
* Select and reorder chart stats
* Toggle between showing ranks and global max stats in the stat tables
* Changes to settings are saved automatically

## Examples

Bar chart

![GitHub Logo](/images/bar-chart.png)

Max stats instead of ranks

![GitHub Logo](/images/max-stats.png)

Settings

![GitHub Logo](/images/settings.png)

## Notes

* Stats where smaller is better: drops, drops/game, drops/hour, popped, pops/game, pops/hour, disconnects
* Max stats are the all-time stats of all players that have played >100 games.
* "Settings" link appears on hover.
* "Reset All" deletes your local changes to the settings.

### Development

Install dependencies:

`$ npm install`

Build the project into `dist/`:

`$ gulp`

Push the `dist/` folder into github's `gh-pages` branch:

`$ gulp deploy`
